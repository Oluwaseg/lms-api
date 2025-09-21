import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1695297602000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(30),
        address TEXT,
        picture VARCHAR(255),
        role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
        code VARCHAR(32) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        status VARCHAR(32) DEFAULT 'active',
        is_verified BOOLEAN DEFAULT false,
        last_login TIMESTAMP,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
      CREATE INDEX IF NOT EXISTS idx_users_code ON users (code);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS users;`);
  }
}
