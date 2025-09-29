import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';
import { ResponseHandler } from '../utils/response.handler';

export class CourseController {
  static async create(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const payload = (req as any).validated?.body ?? req.body;
      const course = await CourseService.create(instructorId, payload);
      return res
        .status(201)
        .json(
          ResponseHandler.success({ id: course.id }, 'Course created', 201)
        );
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to create course', 400)
        );
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const { id } = req.params;
      const payload = (req as any).validated?.body ?? req.body;
      const course = await CourseService.update(instructorId, id, payload);
      return res.json(ResponseHandler.success(course, 'Course updated'));
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to update course', 400)
        );
    }
  }

  static async publish(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const { id } = req.params;
      const course = await CourseService.publish(instructorId, id);
      return res.json(ResponseHandler.success(course, 'Course published'));
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to publish course', 400)
        );
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await CourseService.get(id);
      if (!course)
        return res
          .status(404)
          .json(ResponseHandler.notFound('Course not found'));
      return res.json(ResponseHandler.success(course, 'Course'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          ResponseHandler.error(err.message || 'Failed to fetch course', 500)
        );
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const courses = await CourseService.list(true);
      return res.json(ResponseHandler.success(courses, 'Courses list'));
    } catch (err: any) {
      return res
        .status(500)
        .json(
          ResponseHandler.error(err.message || 'Failed to list courses', 500)
        );
    }
  }
}
