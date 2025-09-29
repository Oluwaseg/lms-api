import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { ParentChild } from '../entities/ParentChild';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';
import { sendParentVerificationEmail } from '../utils/mailer';

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
      if (saved.email) await sendParentVerificationEmail(saved.email, token);
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

    // create verification/invite token if email provided
    if (childData.email) {
      // Mark any previous unused tokens for this user as used (single-active-token)
      await tokenRepo
        .createQueryBuilder()
        .update()
        .set({ used: true })
        .where('user_id = :userId', { userId: savedChild.id })
        .andWhere('used = :used', { used: false })
        .execute();

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
        // Use a dedicated invite email template (do not re-use verification email for invites)
        // sendInviteEmail is more appropriate here (includes parent/child names and invite link)
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {
          sendInviteEmail,
          sendVerificationEmail,
        } = require('../utils/mailer');
        if (childData.email) {
          // For child accounts created by parent, send the invite template which contains parent/child names
          await sendInviteEmail(childData.email, token, {
            recipientName: childData.name,
            parentName: parent.name,
            expiresHours: 24,
          });
        }
        // Also send a verification email for parents creating a child (optional, won't duplicate if invite covers it)
        // (kept here for backward-compatibility in case callers expect a verification-style email)
        // if you prefer to skip, remove the following line.
        // if (childData.email) await sendVerificationEmail(childData.email, token, 'student');
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to send invite email', e);
      }
      return { child: savedChild, link: pc };
    }

    return { child: savedChild, link: pc };
  }

  static async getChildren(parentId: string) {
    // Return list of children linked to this parent with basic info
    const relations = await parentChildRepo.find({
      where: { parent: { id: parentId } } as any,
      relations: ['child'],
    });
    return relations.map((r) => {
      const c = r.child as User;
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        isVerified: c.isVerified,
        relationship: r.relationship || null,
        linkedAt: r.createdAt,
      };
    });
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

  static async resendVerification(email: string) {
    const user = await userRepo.findOne({ where: { email } });
    if (!user) throw new Error('User not found');
    if (user.isVerified) throw new Error('User already verified');

    const token = crypto.randomBytes(32).toString('hex');
    const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const vt = tokenRepo.create({
      user,
      tokenHash: hmac,
      type: 'email_verification',
      expiresAt,
      used: false,
    } as Partial<VerificationToken>);
    await tokenRepo.save(vt);

    try {
      if (user.email) await sendParentVerificationEmail(user.email, token);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to send verification email', e);
    }

    return { success: true };
  }

  static async updateProfile(userId: string, data: { name?: string }) {
    const user = (await userRepo.findOne({
      where: { id: userId },
    })) as User | null;
    if (!user) throw new Error('User not found');
    // Disallow email updates here - email can only be changed through a separate flow
    if (data.name) user.name = data.name;
    const saved = await userRepo.save(user);
    const { id, name, email, isVerified, lastLogin } = saved;
    return { id, name, email, isVerified, lastLogin };
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = (await userRepo.findOne({
      where: { id: userId },
    })) as User | null;
    if (!user) throw new Error('User not found');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new Error('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 10);
    await userRepo.save(user);
    return { success: true };
  }
}
