import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { VerificationToken } from '../entities/VerificationToken';

const tokenRepo = AppDataSource.getRepository(VerificationToken);
const userRepo = AppDataSource.getRepository(User);

export class InviteService {
  static async validateToken(rawToken: string) {
    const secret = process.env.TOKEN_SECRET || 'dev-token-secret';
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(rawToken)
      .digest('hex');

    let vt = await tokenRepo.findOne({
      where: { tokenHash: hmac },
      relations: ['user'],
    });
    if (!vt) {
      const legacy = crypto.createHash('sha256').update(rawToken).digest('hex');
      vt = await tokenRepo.findOne({
        where: { tokenHash: legacy },
        relations: ['user'],
      });
    }
    if (!vt) throw new Error('Invalid token');
    if (vt.used) throw new Error('Token already used');
    if (vt.expiresAt < new Date()) throw new Error('Token expired');
    return vt;
  }

  static async acceptInvite(
    rawToken: string,
    password: string,
    autoSignin = false
  ) {
    const vt = await this.validateToken(rawToken);
    const user = vt.user as User;

    // set password and mark verified
    user.password = await bcrypt.hash(password, 10);
    user.isVerified = true;
    await userRepo.save(user);

    vt.used = true;
    await tokenRepo.save(vt);

    if (autoSignin) {
      const refreshed = await userRepo.findOne({
        where: { id: user.id },
        relations: ['role'],
      });
      const roleName = refreshed?.role?.name;
      const token = jwt.sign(
        { sub: user.id, role: roleName },
        process.env.JWT_SECRET || 'dev-jwt',
        { expiresIn: '7d' }
      );
      return { jwt: token };
    }
    return { success: true };
  }
}
