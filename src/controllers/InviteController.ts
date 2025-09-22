import { Request, Response } from 'express';
import { InviteService } from '../services/InviteService';
import { ResponseHandler } from '../utils/response.handler';

export class InviteController {
  static async validate(req: Request, res: Response) {
    try {
      const token = (req as any).validated?.query?.token ?? req.query.token;
      const vt = await InviteService.validateToken(token as string);
      const user = vt.user;
      return res.json(
        ResponseHandler.success({ name: user.name }, 'Valid invite')
      );
    } catch (err: any) {
      return res
        .status(400)
        .json(ResponseHandler.error(err.message || 'Invalid invite', 400));
    }
  }

  static async accept(req: Request, res: Response) {
    try {
      const payload = (req as any).validated?.body ?? req.body;
      const { token, password } = payload as {
        token: string;
        password: string;
      };
      const result = await InviteService.acceptInvite(token, password, true);
      if ((result as any).jwt) {
        return res.json(
          ResponseHandler.success(
            { token: (result as any).jwt },
            'Invite accepted and logged in'
          )
        );
      }
      return res.json(ResponseHandler.success(null, 'Invite accepted'));
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to accept invite', 400)
        );
    }
  }
}
