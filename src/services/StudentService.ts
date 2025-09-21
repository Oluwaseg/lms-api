import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';
import { sendVerificationEmail } from '../utils/mailer';

const userRepository = AppDataSource.getRepository(User);
const tokenRepository = AppDataSource.getRepository(VerificationToken);
const roleRepository = AppDataSource.getRepository(Role);

const ROLE_PREFIX: Record<string, string> = {
  student: 'STU',
  parent: 'PAR',
  instructor: 'INS',
  moderator: 'MOD',
  admin: 'ADM',
};

export class StudentService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
  }) {
    const existingUser = await userRepository.findOne({
      where: { email: data.email },
    });
    if (existingUser) throw new Error('User already exists');

    const hashed = await bcrypt.hash(data.password, 10);

    const role = (await roleRepository.findOne({
      where: { name: 'student' },
    })) as Role;
    const prefix = ROLE_PREFIX.student;
    const code = `${prefix}${Math.floor(10000 + Math.random() * 90000)}`;

    const user = userRepository.create({
      name: data.name,
      email: data.email,
      password: hashed,
      role,
      code,
    } as Partial<User>) as User;

    const saved = await userRepository.save(user);
    const token = crypto.randomBytes(32).toString('hex');
    // Use HMAC-SHA256 with a server secret for token lookup protection.
    const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');
    const tokenHash = hmac;
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const vt = tokenRepository.create({
      user: saved,
      tokenHash,
      type: 'email_verification',
      expiresAt,
      used: false,
    } as Partial<VerificationToken>);
    await tokenRepository.save(vt);

    // Send verification email (do not return token in any response)
    try {
      if (saved.email) await sendVerificationEmail(saved.email, token);
    } catch (e) {
      // log but don't fail registration if mail fails
      // eslint-disable-next-line no-console
      console.error('Failed to send verification email', e);
    }

    return { user: { id: saved.id, name: saved.name, email: saved.email } };
  }

  static async verify(token: string) {
    const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(token)
      .digest('hex');

    // Try HMAC match first (preferred). For backward compatibility also try legacy sha256 hash.
    let vt = (await tokenRepository.findOne({
      where: { tokenHash: hmac },
      relations: ['user'],
    })) as VerificationToken | null;
    if (!vt) {
      const legacy = crypto.createHash('sha256').update(token).digest('hex');
      vt = (await tokenRepository.findOne({
        where: { tokenHash: legacy },
        relations: ['user'],
      })) as VerificationToken | null;
    }
    if (!vt || vt.used) throw new Error('Invalid or used token');
    if (vt.expiresAt < new Date()) throw new Error('Token expired');

    const user = vt.user;
    user.isVerified = true;
    await userRepository.save(user);

    vt.used = true;
    await tokenRepository.save(vt);

    return { user: { id: user.id, name: user.name, email: user.email } };
  }
}
