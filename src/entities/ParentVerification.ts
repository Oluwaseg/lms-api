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

@Entity('parent_verifications')
export class ParentVerification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'full_name', type: 'varchar', length: 150, nullable: true })
  fullName?: string;

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

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'relationship_notes', type: 'text', nullable: true })
  relationshipNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
