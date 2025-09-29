import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { Lesson } from '../entities/Lesson';

const lessonRepo = AppDataSource.getRepository(Lesson);
const courseRepo = AppDataSource.getRepository(Course);

export class LessonService {
  static async create(instructorId: string, courseId: string, data: any) {
    const course = (await courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    })) as Course | null;
    if (!course) throw new Error('Course not found');
    if (course.instructor.id !== instructorId)
      throw new Error('Not authorized');
    const lesson = lessonRepo.create({
      course,
      title: data.title,
      content: data.content || null,
      videoUrl: data.videoUrl || null,
      position: data.position || 0,
      durationSeconds: data.durationSeconds || 0,
    } as Partial<Lesson>);
    return lessonRepo.save(lesson);
  }

  static async list(courseId: string) {
    return lessonRepo.find({ where: { course: { id: courseId } } as any });
  }

  static async setVideoUrl(
    instructorId: string,
    lessonId: string,
    videoUrl: string
  ) {
    const lesson = (await lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['course', 'course.instructor'],
    })) as Lesson | null;
    if (!lesson) throw new Error('Lesson not found');
    if (lesson.course.instructor.id !== instructorId)
      throw new Error('Not authorized');
    lesson.videoUrl = videoUrl;
    return lessonRepo.save(lesson);
  }
}
