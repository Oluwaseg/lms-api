import { Request, Response } from 'express';

export class AuthController {
  static async register(_req: Request, res: Response) {
    res.status(410).json({
      success: false,
      message: 'Deprecated: use /students or /instructors or /parents',
    });
  }

  static async verify(_req: Request, res: Response) {
    res.status(410).json({ success: false, message: 'Deprecated' });
  }

  static async login(_req: Request, res: Response) {
    res.status(410).json({ success: false, message: 'Deprecated' });
  }
}
