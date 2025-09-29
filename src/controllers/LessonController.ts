import { Request, Response } from 'express';
import { LessonService } from '../services/LessonService';
import { ResponseHandler } from '../utils/response.handler';

export class LessonController {
  static async create(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const { courseId } = req.params;
      const payload = (req as any).validated?.body ?? req.body;
      const lesson = await LessonService.create(
        instructorId,
        courseId,
        payload
      );
      return res
        .status(201)
        .json(
          ResponseHandler.success({ id: lesson.id }, 'Lesson created', 201)
        );
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to create lesson', 400)
        );
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const lessons = await LessonService.list(courseId);
      return res.json(ResponseHandler.success(lessons, 'Lessons list'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          ResponseHandler.error(err.message || 'Failed to list lessons', 500)
        );
    }
  }
}
