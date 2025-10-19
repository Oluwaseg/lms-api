import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInstructorProfiles1760898653569
  implements MigrationInterface
{
  name = 'CreateInstructorProfiles1760898653569';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS instructor_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        specialization VARCHAR(255),
        experience_years INT,
        qualification VARCHAR(255),
        government_id VARCHAR(255),
        document_url VARCHAR(255),
        verification_status VARCHAR(32) DEFAULT 'pending', -- pending | approved | rejected
        reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL, -- admin/moderator who reviewed
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_instructor_user ON instructor_profiles (user_id);
      CREATE INDEX IF NOT EXISTS idx_instructor_status ON instructor_profiles (verification_status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS instructor_profiles;`);
  }
}
