import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstructorProfile } from './InstructorProfile';
import { ParentChild } from './ParentChild';
import { Role } from './Role';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  username?: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 16, nullable: true })
  gender?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  picture?: string;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role?: Role;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 32, unique: true })
  code!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 32, default: 'active' })
  status!: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ name: 'login_attempts', type: 'int', default: 0 })
  loginAttempts!: number;

  @Column({ name: 'blocked_until', type: 'timestamp', nullable: true })
  blockedUntil?: Date;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'last_password_change', type: 'timestamp', nullable: true })
  lastPasswordChange?: Date;

  @Column({ type: 'jsonb', default: () => `'{}'` })
  metadata!: Record<string, any>;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne(() => InstructorProfile, (profile) => profile.user)
  instructorProfile?: InstructorProfile;
  @OneToMany(() => ParentChild, (relation) => relation.parent)
  children?: ParentChild[];

  @OneToMany(() => ParentChild, (relation) => relation.child)
  parents?: ParentChild[];
}
