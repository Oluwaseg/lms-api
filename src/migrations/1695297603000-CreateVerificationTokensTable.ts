import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVerificationTokensTable1695297603000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(128),
        token VARCHAR(128),
        type VARCHAR(32) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens (user_id);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens (token);
      CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash ON verification_tokens (token_hash);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS verification_tokens;`);
  }
}
