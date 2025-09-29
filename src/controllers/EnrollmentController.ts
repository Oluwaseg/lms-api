import { Request, Response } from 'express';
import { EnrollmentService } from '../services/EnrollmentService';
import { ResponseHandler } from '../utils/response.handler';

export class EnrollmentController {
  static async enroll(req: Request, res: Response) {
    try {
      const studentId = (req as any).user?.sub as string;
      const { courseId } = req.params;
      const enrollment = await EnrollmentService.enrollStudent(
        studentId,
        courseId
      );
      return res
        .status(201)
        .json(ResponseHandler.success({ id: enrollment.id }, 'Enrolled', 201));
    } catch (err: any) {
      return res
        .status(400)
        .json(ResponseHandler.error(err.message || 'Failed to enroll', 400));
    }
  }

  static async listMine(req: Request, res: Response) {
    try {
      const studentId = (req as any).user?.sub as string;
      const enrollments = await EnrollmentService.listForStudent(studentId);
      return res.json(ResponseHandler.success(enrollments, 'My enrollments'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          ResponseHandler.error(
            err.message || 'Failed to fetch enrollments',
            500
          )
        );
    }
  }
}
