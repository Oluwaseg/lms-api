import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { InstructorService } from '../services/InstructorService';
import { ResponseHandler } from '../utils/response.handler';

export class InstructorController {
  static async register(req: Request, res: Response) {
    try {
      const payload = (req as any).validated?.body ?? req.body;
      const result = await InstructorService.register(payload as any);
      return res
        .status(201)
        .json(
          ResponseHandler.success(
            { id: result.user.id },
            'Registration successful. A verification email has been sent if an email was provided.',
            201
          )
        );
    } catch (err: any) {
      return res.status(400).json(ResponseHandler.error(err.message, 400));
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const token = req.query.token as string;
      if (!token) {
        return res
          .status(400)
          .json(ResponseHandler.error('Verification token is required', 400));
      }
      const result = await InstructorService.verify(token);
      return res.json(
        ResponseHandler.success(
          { id: result.user.id },
          'Email verified successfully.'
        )
      );
    } catch (err: any) {
      return res.status(400).json(ResponseHandler.error(err.message, 400));
    }
  }

  static async resendVerification(req: Request, res: Response) {
    try {
      const payload = (req as any).validated?.body ?? req.body;
      const { email } = payload as { email: string };
      await InstructorService.resendVerification(email);
      return res.json(
        ResponseHandler.success(null, 'Verification email resent')
      );
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(
            err.message || 'Failed to resend verification',
            400
          )
        );
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.sub as string;
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ['role'],
      });
      if (!user)
        return res.status(404).json(ResponseHandler.notFound('User not found'));
      const { id, name, email, role, code, isVerified, lastLogin } = user;
      return res.json(
        ResponseHandler.success(
          { id, name, email, role, code, isVerified, lastLogin },
          'User profile'
        )
      );
    } catch (err: any) {
      return res
        .status(500)
        .json(
          ResponseHandler.error(err.message || 'Failed to fetch user', 500)
        );
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.sub as string;
      const payload = (req as any).validated?.body ?? req.body;
      const result = await InstructorService.updateProfile(userId, payload);
      return res.json(ResponseHandler.success(result, 'Profile updated'));
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to update profile', 400)
        );
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.sub as string;
      const payload = (req as any).validated?.body ?? req.body;
      const { currentPassword, newPassword } = payload as {
        currentPassword: string;
        newPassword: string;
      };
      await InstructorService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      return res.json(ResponseHandler.success(null, 'Password changed'));
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to change password', 400)
        );
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const payload = (req as any).validated?.body ?? req.body;
      const { email, password } = payload as {
        email: string;
        password: string;
      };
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user)
        return res
          .status(401)
          .json(ResponseHandler.unauthorized('Invalid credentials'));
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res
          .status(401)
          .json(ResponseHandler.unauthorized('Invalid credentials'));
      // Ensure this login is for an instructor role
      if (user.role?.name !== 'instructor')
        return res
          .status(403)
          .json(
            ResponseHandler.forbidden('Not authorized for instructor login')
          );
      // Ensure user has verified their email
      if (!user.isVerified)
        return res
          .status(403)
          .json(
            ResponseHandler.forbidden(
              'Email not verified. Please resend verification.'
            )
          );
      const token = jwt.sign(
        { sub: user.id, role: user.role?.name },
        process.env.JWT_SECRET || 'dev-jwt',
        { expiresIn: '7d' }
      );
      user.lastLogin = new Date();
      await userRepo.save(user);

      return res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(ResponseHandler.success({}, 'Login successful'));
    } catch (err: any) {
      return res
        .status(500)
        .json(ResponseHandler.error(err.message || 'Login failed', 500));
    }
  }
}
