import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { Enrollment } from '../entities/Enrollment';
import { User } from '../entities/User';

const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const courseRepo = AppDataSource.getRepository(Course);
const userRepo = AppDataSource.getRepository(User);

export class EnrollmentService {
  static async enrollStudent(studentId: string, courseId: string) {
    const course = (await courseRepo.findOne({
      where: { id: courseId },
    })) as Course | null;
    if (!course) throw new Error('Course not found');
    const student = (await userRepo.findOne({
      where: { id: studentId },
    })) as User | null;
    if (!student) throw new Error('Student not found');
    // For now, only free enrollments are created here. Paid flow will be added later.
    if (course.isPaid) throw new Error('Course requires payment');
    const existing = await enrollmentRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } } as any,
    });
    if (existing) return existing;
    const en = enrollmentRepo.create({
      student,
      course,
      paymentStatus: 'free',
    } as Partial<Enrollment>);
    return enrollmentRepo.save(en);
  }

  static async listForStudent(studentId: string) {
    return enrollmentRepo.find({
      where: { student: { id: studentId } } as any,
      relations: ['course'],
    });
  }
}
