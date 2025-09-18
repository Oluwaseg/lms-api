import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/AuthService';
import { ResponseHandler } from '../utils/response.handler';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(
          ResponseHandler.error(
            'Validation failed',
            400,
            errors.array().map((error) => ({
              field: 'unknown',
              message: error.msg,
            }))
          )
        );
      }

      const result = await AuthService.register(req.body);
      const response = ResponseHandler.success(
        result,
        'Registration successful. Please check your email for verification.',
        201
      );
      res.status(201).json(response);
    } catch (error: any) {
      if (error.message === 'User already exists') {
        return res
          .status(409)
          .json(
            ResponseHandler.error('Registration failed', 409, [
              { field: 'email', message: 'User already exists' },
            ])
          );
      }
      res
        .status(400)
        .json(
          ResponseHandler.error('Registration failed', 400, [
            {
              field: 'unknown',
              message: error.message || 'Something went wrong',
            },
          ])
        );
    }
  }

  static async verify(req: Request, res: Response) {
    try {
      const result = await AuthService.verify(req.params.token);
      res
        .status(200)
        .json(ResponseHandler.success(result, 'Email verified successfully'));
    } catch (error: any) {
      res
        .status(400)
        .json(
          ResponseHandler.error('Verification failed', 400, [
            {
              field: 'token',
              message: error.message || 'Invalid verification token',
            },
          ])
        );
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json(
          ResponseHandler.error(
            'Validation failed',
            400,
            errors.array().map((error) => ({
              field: 'unknown',
              message: error.msg,
            }))
          )
        );
      }

      const result = await AuthService.login(req.body);
      res.status(200).json(ResponseHandler.success(result, 'Login successful'));
    } catch (error: any) {
      const statusCode =
        error.message === 'Please verify your email first' ? 403 : 401;
      const field = error.message.includes('verify') ? 'email' : 'credentials';
      res
        .status(statusCode)
        .json(
          ResponseHandler.error('Authentication failed', statusCode, [
            { field, message: error.message || 'Invalid credentials' },
          ])
        );
    }
  }
}
