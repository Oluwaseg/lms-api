import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'parents_children' })
@Unique(['parent', 'child'])
export class ParentChild {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  parent!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  child!: User;

  @Column({ type: 'varchar', length: 32, nullable: true })
  relationship?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
