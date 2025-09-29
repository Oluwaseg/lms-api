import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string; // sanitized HTML

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  thumbnailUrl?: string;

  @Column({
    name: 'short_video_url',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  shortVideoUrl?: string;

  // optional additional image URLs stored as JSON array
  @Column({ name: 'images', type: 'simple-json', nullable: true })
  images?: string[];

  @Column({ type: 'bigint', name: 'price_cents', default: 0 })
  priceCents!: number;

  @Column({ type: 'varchar', length: 8, name: 'currency', default: 'USD' })
  currency!: string;

  @Column({ type: 'boolean', name: 'is_paid', default: false })
  isPaid!: boolean;

  @ManyToOne(() => User, { nullable: false })
  instructor!: User;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status!: string; // draft | published | archived

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
