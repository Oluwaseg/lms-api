import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';
export class SeedInitialUsers1760900080456 implements MigrationInterface {
  name = 'SeedInitialUsers1760900080456';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash default password
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // Fetch role IDs dynamically
    const roles = await queryRunner.query(`SELECT id, name FROM roles;`);
    const roleMap = Object.fromEntries(roles.map((r: any) => [r.name, r.id]));

    // Generate user codes
    const genCode = () =>
      Math.random().toString(36).substring(2, 10).toUpperCase();

    await queryRunner.query(`
      INSERT INTO users (name, username, email, phone, role_id, code, password, status, is_verified)
      VALUES
        ('System Admin', 'admin', 'admin@lms.com', '+2348000000001', '${
          roleMap['admin']
        }', '${genCode()}', '${passwordHash}', 'active', true),
        ('John Instructor', 'instructor', 'instructor@lms.com', '+2348000000002', '${
          roleMap['instructor']
        }', '${genCode()}', '${passwordHash}', 'active', true),
        ('Mary Parent', 'parent', 'parent@lms.com', '+2348000000003', '${
          roleMap['parent']
        }', '${genCode()}', '${passwordHash}', 'active', true),
        ('Alex Student', 'student', 'student@lms.com', '+2348000000004', '${
          roleMap['student']
        }', '${genCode()}', '${passwordHash}', 'active', true);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM users WHERE email IN (
        'admin@lms.com',
        'instructor@lms.com',
        'parent@lms.com',
        'student@lms.com'
      );
    `);
  }
}
