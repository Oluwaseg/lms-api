import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { ResponseHandler } from "../utils/response.handler";

export class AuthController {
  /**
   * Verify a login JWT.
   * - Accepts token via Authorization: Bearer <token> or ?token=<token>
   * - Optional query param `role` to enforce token belongs to a specific role (student|parent|instructor)
   */
  static async verify(_req: Request, res: Response) {
    try {
      const req = _req as Request;
      let token: string | undefined;

      // 1️⃣ Check Authorization header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        token = authHeader.slice(7).trim();
      }

      // 2️⃣ Check query param
      if (!token) token = (req.query.token as string) || undefined;

      // 3️⃣ ✅ Check cookie
      if (!token && req.cookies?.token) {
        token = req.cookies.token;
        console.log("✅ Token found in cookie");
      }

      if (!token) {
        return res
          .status(400)
          .json(ResponseHandler.error("Token is required", 400));
      }

      console.log("checking token", token);

      const secret = process.env.JWT_SECRET || "dev-jwt";
      let payload: any;
      try {
        payload = jwt.verify(token, secret);
      } catch (err) {
        return res
          .status(401)
          .json(ResponseHandler.unauthorized("Invalid or expired token"));
      }

      const userId = payload?.sub;
      const tokenRole = payload?.role;

      if (!userId)
        return res
          .status(401)
          .json(ResponseHandler.unauthorized("Invalid token payload"));

      const requiredRole = req.query.role as string;
      if (requiredRole && tokenRole && tokenRole !== requiredRole) {
        return res
          .status(403)
          .json(
            ResponseHandler.forbidden(
              "Token role does not match required role",
            ),
          );
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["role"],
      });

      if (!user)
        return res.status(404).json(ResponseHandler.notFound("User not found"));

      const { id, name, email, role, code, isVerified, lastLogin } = user;
      return res.json(
        ResponseHandler.success(
          { id, name, email, role, code, isVerified, lastLogin },
          "Token is valid",
        ),
      );
    } catch (err: any) {
      return res
        .status(500)
        .json(ResponseHandler.error(err.message || "Verification failed", 500));
    }
  }
}
