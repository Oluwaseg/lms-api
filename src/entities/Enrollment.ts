import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './Course';
import { User } from './User';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  student!: User;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  course!: Course;

  @Column({
    name: 'payment_status',
    type: 'varchar',
    length: 32,
    default: 'free',
  })
  paymentStatus!: string; // free | pending | paid

  @CreateDateColumn({ name: 'enrolled_at' })
  enrolledAt!: Date;
}
