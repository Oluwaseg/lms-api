import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { ParentService } from '../services/ParentService';
import { ResponseHandler } from '../utils/response.handler';

export class ParentController {
  static async linkChild(req: Request, res: Response) {
    try {
      const parentId = req.user?.sub as string;
      const payload = (req as any).validated?.body ?? req.body;
      const { childCode, relationship } = payload;
      const pc = await ParentService.linkChild(
        parentId,
        childCode,
        relationship
      );
      return res.json(
        ResponseHandler.success({ id: pc.id }, 'Child linked to parent.')
      );
    } catch (err: any) {
      return res.status(400).json(ResponseHandler.error(err.message, 400));
    }
  }

  static async createChild(req: Request, res: Response) {
    try {
      const parentId = req.user?.sub as string;
      const payload = (req as any).validated?.body ?? req.body;
      const { name, email } = payload;
      const result = await ParentService.createChildAndInvite(parentId, {
        name,
        email,
      });
      // result may include a plaintext token only in non-production (service controls this)
      const child = (result as any).child;
      return res
        .status(201)
        .json(
          ResponseHandler.success(
            { id: child.id },
            'Child created and invite sent.',
            201
          )
        );
    } catch (err: any) {
      return res.status(400).json(ResponseHandler.error(err.message, 400));
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const payload = (req as any).validated?.body ?? req.body;
      const { name, email, password } = payload as {
        name: string;
        email: string;
        password: string;
      };
      const result = await ParentService.register({ name, email, password });
      return res
        .status(201)
        .json(
          ResponseHandler.success(
            { id: result.user.id },
            'Parent registered',
            201
          )
        );
    } catch (err: any) {
      return res
        .status(400)
        .json(ResponseHandler.error(err.message || 'Registration failed', 400));
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const result = await ParentService.verify(req.params.token);
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
      // ensure role is parent
      if (user.role?.name !== 'parent')
        return res
          .status(403)
          .json(ResponseHandler.forbidden('Not authorized for parent login'));
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
