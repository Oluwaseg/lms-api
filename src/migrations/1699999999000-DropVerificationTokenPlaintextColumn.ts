import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropVerificationTokenPlaintextColumn1699999999000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // only drop if column exists to be safe
    const hasColumn = await queryRunner.hasColumn(
      'verification_tokens',
      'token'
    );
    if (hasColumn) {
      await queryRunner.query(
        'ALTER TABLE verification_tokens DROP COLUMN IF EXISTS token'
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // add column back for rollback (nullable)
    await queryRunner.query(
      'ALTER TABLE verification_tokens ADD COLUMN IF NOT EXISTS token VARCHAR(128)'
    );
  }
}
