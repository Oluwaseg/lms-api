import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

/*
 NOTE (dev): The `token` column below is kept temporarily for development/testing convenience so you
 can copy-paste verification tokens from the DB or Swagger while verifying flows. BEFORE deploying to
 production you SHOULD REMOVE the `token` column and stop writing or returning raw tokens from the API.

 Current hashing approach uses HMAC-SHA256 with a server-side secret (`process.env.TOKEN_SECRET`).
 This prevents attackers who leak the DB from trivially verifying tokens without the secret.

 If you prefer PBKDF2 (cost-hardening), change the schema to store salt/iterations and the PBKDF2 output
 (or store an additional indexed HMAC for lookup + PBKDF2 for verification). That requires a migration.
*/

@Entity({ name: 'verification_tokens' })
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Store only the token hash (HMAC-SHA256). Keep plaintext token optional for dev/testing but prefer hash.
  @Index()
  @Column({ type: 'varchar', name: 'token_hash', length: 128 })
  tokenHash!: string;

  // Plaintext token column removed from entity; kept only in DB temporarily during migration.
  // Do not write or return plaintext tokens in production.

  @Column({ type: 'varchar', length: 32 })
  type!: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ type: 'boolean', default: false })
  used!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
