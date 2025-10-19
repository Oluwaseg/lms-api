import { MigrationInterface, QueryRunner } from 'typeorm';

export class ParentVerification1760899809581 implements MigrationInterface {
  name = 'ParentVerification1760899809581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS parent_verifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(150),
        government_id VARCHAR(255),
        document_url VARCHAR(255),
        verification_status VARCHAR(32) DEFAULT 'pending', -- pending | approved | rejected
        verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
        verified_at TIMESTAMP,
        relationship_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_parent_verifications_user ON parent_verifications (user_id);
      CREATE INDEX IF NOT EXISTS idx_parent_verifications_status ON parent_verifications (verification_status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS parent_verifications;`);
  }
}
