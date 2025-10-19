import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('parents_children')
export class ParentChild {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent!: User;

  @ManyToOne(() => User, (user) => user.parents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'child_id' })
  child!: User;

  @Column({ type: 'varchar', length: 32, nullable: true })
  relationship?: string;

  @Column({ type: 'varchar', length: 32, default: 'pending' })
  status!: string;

  @Column({
    name: 'invitation_code',
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  invitationCode?: string;

  @Column({
    name: 'invited_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  invitedAt!: Date;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
