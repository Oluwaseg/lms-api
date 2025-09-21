import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { InstructorService } from '../services/InstructorService';
import { ResponseHandler } from '../utils/response.handler';

export class InstructorController {
  static async register(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

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
      const result = await InstructorService.verify(req.params.token);
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
      const token = jwt.sign(
        { sub: user.id, role: user.role?.name },
        process.env.JWT_SECRET || 'dev-jwt',
        { expiresIn: '7d' }
      );
      user.lastLogin = new Date();
      await userRepo.save(user);
      return res.json(ResponseHandler.success({ token }, 'Login successful'));
    } catch (err: any) {
      return res
        .status(500)
        .json(ResponseHandler.error(err.message || 'Login failed', 500));
    }
  }
}
