import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('instructor_profiles')
export class InstructorProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.instructorProfile)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialization?: string;

  @Column({ name: 'experience_years', type: 'int', nullable: true })
  experienceYears?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qualification?: string;

  @Column({
    name: 'government_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  governmentId?: string;

  @Column({
    name: 'document_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  documentUrl?: string;

  @Column({
    name: 'verification_status',
    type: 'varchar',
    length: 32,
    default: 'pending',
  })
  verificationStatus!: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
