import { Request, Response } from 'express';
import { CourseService } from '../services/CourseService';
import { uploadFileStream } from '../utils/cloudinary';
import { ResponseHandler } from '../utils/response.handler';

export class CourseMediaController {
  static async uploadThumbnail(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const { id } = req.params;
      const file = req.file as any;
      if (!file || !file.path)
        return res
          .status(400)
          .json(ResponseHandler.error('No file uploaded', 400));
      const url = await uploadFileStream(file.path, {
        folder: 'courses/thumbnails',
      });
      await CourseService.update(instructorId, id, { thumbnailUrl: url });
      return res.json(
        ResponseHandler.success({ thumbnailUrl: url }, 'Thumbnail uploaded')
      );
    } catch (err: any) {
      return res
        .status(400)
        .json(
          ResponseHandler.error(
            err.message || 'Failed to upload thumbnail',
            400
          )
        );
    }
  }

  static async uploadShortVideo(req: Request, res: Response) {
    try {
      const instructorId = (req as any).user?.sub as string;
      const { id } = req.params;
      const file = req.file as any;
      if (!file || !file.path)
        return res
          .status(400)
          .json(ResponseHandler.error('No file uploaded', 400));
      const url = await uploadFileStream(file.path, {
        folder: 'courses/videos',
      });
      await CourseService.update(instructorId, id, { shortVideoUrl: url });
      return res.json(
        ResponseHandler.success({ shortVideoUrl: url }, 'Short video uploaded')
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
