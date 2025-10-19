import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1695297602000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30),
        address TEXT,
        gender VARCHAR(16),
        date_of_birth DATE,
        picture VARCHAR(255),
        role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
        code VARCHAR(32) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(32) DEFAULT 'active',
        is_verified BOOLEAN DEFAULT false,
        login_attempts INT DEFAULT 0,
        blocked_until TIMESTAMP,
        last_login TIMESTAMP,
        last_password_change TIMESTAMP,
        metadata JSONB DEFAULT '{}'::jsonb,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_users_code ON users (code);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
