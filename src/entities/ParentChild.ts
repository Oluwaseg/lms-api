import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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
  @JoinColumn({ name: 'parent_id' })
  parent!: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child!: User;

  @Column({ type: 'varchar', length: 32, nullable: true })
  relationship?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
