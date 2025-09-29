import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { User } from '../entities/User';
import { sanitize } from '../utils/sanitizer';

const courseRepo = AppDataSource.getRepository(Course);
const userRepo = AppDataSource.getRepository(User);

export class CourseService {
  static async create(instructorId: string, data: any) {
    const instructor = (await userRepo.findOne({
      where: { id: instructorId },
    })) as User | null;
    if (!instructor) throw new Error('Instructor not found');
    if (!data.thumbnailUrl) throw new Error('thumbnailUrl is required');
    const course = courseRepo.create({
      title: data.title,
      description: sanitize(data.description) || null,
      priceCents: data.priceCents || 0,
      currency: data.currency || 'USD',
      isPaid: (data.priceCents || 0) > 0,
      instructor,
      status: data.status || 'draft',
      thumbnailUrl: data.thumbnailUrl,
      shortVideoUrl: data.shortVideoUrl || null,
      images: data.images || null,
    } as Partial<Course>);
    const saved = await courseRepo.save(course);
    return saved;
  }

  static async update(instructorId: string, courseId: string, data: any) {
    const course = (await courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    })) as Course | null;
    if (!course) throw new Error('Course not found');
    if (course.instructor.id !== instructorId)
      throw new Error('Not authorized');
    if (data.title) course.title = data.title;
    if (typeof data.description !== 'undefined')
      course.description = sanitize(data.description) as any;
    if (typeof data.priceCents !== 'undefined') {
      course.priceCents = data.priceCents;
      course.isPaid = data.priceCents > 0;
    }
    if (data.currency) course.currency = data.currency;
    if (data.status) course.status = data.status;
    if (typeof data.thumbnailUrl !== 'undefined')
      course.thumbnailUrl = data.thumbnailUrl;
    if (typeof data.shortVideoUrl !== 'undefined')
      course.shortVideoUrl = data.shortVideoUrl;
    if (typeof data.images !== 'undefined') course.images = data.images;
    const saved = await courseRepo.save(course);
    return saved;
  }

  static async get(courseId: string) {
    return courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    });
  }

  static async list(publishedOnly = true) {
    if (publishedOnly) {
      return courseRepo.find({ where: { status: 'published' } });
    }
    return courseRepo.find();
  }

  static async publish(instructorId: string, courseId: string) {
    const course = (await courseRepo.findOne({
      where: { id: courseId },
      relations: ['instructor'],
    })) as Course | null;
    if (!course) throw new Error('Course not found');
    if (course.instructor.id !== instructorId)
      throw new Error('Not authorized');
    course.status = 'published';
    course.publishedAt = new Date();
    const saved = await courseRepo.save(course);
    return saved;
  }
}
