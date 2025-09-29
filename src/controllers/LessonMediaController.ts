import { Request, Response } from 'express';
import { LessonService } from '../services/LessonService';
import { uploadBuffer } from '../utils/cloudinary';
import { ResponseHandler } from '../utils/response.handler';

export class LessonMediaController {
  static async uploadVideo(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const { lessonId } = req.params;
      const file = req.file as Express.Multer.File | undefined;
      if (!file || !file.buffer)
        return res
          .status(400)
          .json(ResponseHandler.error('No file uploaded', 400));
      // Build a public_id so we can see instructor and lesson mapping in Cloudinary
      const publicId = `instructors/${instructorId}/lessons/${lessonId}-${Date.now()}`;
      const url = await uploadBuffer(file.buffer as Buffer, {
        folder: '',
        public_id: publicId,
        resource_type: 'video',
      });
      // Save url into lesson
      const updated = await LessonService.setVideoUrl(
        instructorId,
        lessonId,
        url
      );
      return res.json(
        ResponseHandler.success({ videoUrl: url }, 'Lesson video uploaded')
      );
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(err.message || 'Failed to upload video', 400)
        );
    }
  }
}
