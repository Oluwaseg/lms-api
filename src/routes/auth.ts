import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export const authRouter = Router();

// Verify a login JWT (Authorization: Bearer <token> or ?token=). Optional ?role=student
authRouter.get("/verify", AuthController.verify);
