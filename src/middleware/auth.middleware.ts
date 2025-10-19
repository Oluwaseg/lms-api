import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  role?: string;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    let token: string | undefined;

    // 1️⃣ Try cookie first
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 2️⃣ Then try Authorization header
    const authHeader = req.headers.authorization;
    if (!token && authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    console.log('checking token', token);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Missing authorization' });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || 'dev-jwt'
    ) as JwtPayload;

    (req as any).user = payload;
    next();
  } catch (e: any) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function requireRole(roleName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as JwtPayload | undefined;
    if (!user)
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (user.role !== roleName)
      return res.status(403).json({ success: false, message: 'Forbidden' });
    return next();
  };
}
