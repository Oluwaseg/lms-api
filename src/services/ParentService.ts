import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { ParentChild } from '../entities/ParentChild';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';
import { sendVerificationEmail } from '../utils/mailer';

const userRepo = AppDataSource.getRepository(User);
const parentChildRepo = AppDataSource.getRepository(ParentChild);
const tokenRepo = AppDataSource.getRepository(VerificationToken);
const roleRepo = AppDataSource.getRepository(Role);

const ROLE_PREFIX: Record<string, string> = {
  student: 'STU',
  parent: 'PAR',
  instructor: 'INS',
  moderator: 'MOD',
  admin: 'ADM',
};

export class ParentService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    // create a parent user (similar to StudentService.register)
    const existing = await userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new Error('User already exists');

    const hashed = await bcrypt.hash(data.password, 10);
    const parentRole = (await roleRepo.findOne({
      where: { name: 'parent' },
    })) as Role;
    const prefix = ROLE_PREFIX.parent || 'PAR';
    const code = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

    const user = userRepo.create({
      name: data.name,
      email: data.email,
      password: hashed,
      role: parentRole || undefined,
      code,
    } as Partial<User>) as User;
    const saved = await userRepo.save(user);
    // create verification token and send email (same pattern as Student/Instructor)
    const token = crypto.randomBytes(32).toString('hex');
    const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');
    const tokenHash = hmac;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const vt = tokenRepo.create({
      user: saved,
      tokenHash,
      type: 'email_verification',
      expiresAt,
      used: false,
    } as Partial<VerificationToken>);
    await tokenRepo.save(vt);
    try {
      if (saved.email) await sendVerificationEmail(saved.email, token);
    } catch (e) {
      // log but don't fail registration
      // eslint-disable-next-line no-console
      console.error('Failed to send verification email', e);
    }

    return { user: { id: saved.id, name: saved.name, email: saved.email } };
  }
  // Link an existing child to parent by child's code
  static async linkChild(
    parentId: string,
    childCode: string,
    relationship?: string
  ) {
    const parent = (await userRepo.findOne({
      where: { id: parentId },
    })) as User | null;
    if (!parent) throw new Error('Parent not found');

    const child = (await userRepo.findOne({
      where: { code: childCode },
    })) as User | null;
    if (!child) throw new Error('Child not found');

    // ensure parent role
    const parentRole = await roleRepo.findOne({ where: { name: 'parent' } });
    if (!parent.role || parent.role.id !== parentRole?.id) {
      throw new Error('Only users with parent role can link children');
    }

    // prevent duplicate link
    const existing = await parentChildRepo.findOne({
      where: { parent: { id: parent.id }, child: { id: child.id } } as any,
    });
    if (existing) throw new Error('Child already linked to this parent');

    const pc = parentChildRepo.create({
      parent,
      child,
      relationship,
    } as Partial<ParentChild>);
    await parentChildRepo.save(pc);
    return pc;
  }

  // Create a child account and link to parent (child will receive invite/verification token)
  static async createChildAndInvite(
    parentId: string,
    childData: { name: string; email?: string }
  ) {
    const parent = (await userRepo.findOne({
      where: { id: parentId },
    })) as User | null;
    if (!parent) throw new Error('Parent not found');

    const childRole = (await roleRepo.findOne({
      where: { name: 'student' },
    })) as Role | null;
    const code = `STU${Math.floor(10000 + Math.random() * 90000)}`;

    const child = userRepo.create({
      name: childData.name,
      email: childData.email || null,
      code,
      role: childRole || undefined,
      password: crypto.randomBytes(8).toString('hex'), // temporary password
    } as Partial<User>) as User;

    const savedChild = await userRepo.save(child);

    const pc = parentChildRepo.create({
      parent,
      child: savedChild,
    } as Partial<ParentChild>);
    await parentChildRepo.save(pc);

    // create verification token if email provided
    if (childData.email) {
      const token = crypto.randomBytes(32).toString('hex');
      const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
      const hmac = crypto
        .createHmac('sha256', secret)
        .update(token)
        .digest('hex');
      const tokenHash = hmac;
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const vt = tokenRepo.create({
        user: savedChild,
        tokenHash,
        type: 'email_verification',
        expiresAt,
        used: false,
      } as Partial<VerificationToken>);
      await tokenRepo.save(vt);
      try {
        if (childData.email)
          await sendVerificationEmail(childData.email, token);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to send verification email', e);
      }
      return { child: savedChild, link: pc };
    }

    return { child: savedChild, link: pc };
  }

  static async verify(token: string) {
    const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');

    // Try HMAC match first. Backwards-compat: also try legacy sha256(token)
    let vt = (await tokenRepo.findOne({
      where: { tokenHash: hmac },
      relations: ['user'],
    })) as VerificationToken | null;
    if (!vt) {
      const legacy = crypto.createHash('sha256').update(token).digest('hex');
      vt = (await tokenRepo.findOne({
        where: { tokenHash: legacy },
        relations: ['user'],
      })) as VerificationToken | null;
    }
    if (!vt || vt.used) throw new Error('Invalid or used token');
    if (vt.expiresAt < new Date()) throw new Error('Token expired');

    const user = vt.user;
    user.isVerified = true;
    await userRepo.save(user);

    vt.used = true;
    await tokenRepo.save(vt);

    return { user: { id: user.id, name: user.name, email: user.email } };
  }
}
