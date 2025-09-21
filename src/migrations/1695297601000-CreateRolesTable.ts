import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolesTable1695297601000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(32) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO roles (name, description)
      VALUES
        ('student', 'Student role'),
        ('parent', 'Parent role'),
        ('instructor', 'Instructor role'),
        ('moderator', 'Moderator role'),
        ('admin', 'Admin role')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS roles;`);
  }
}
