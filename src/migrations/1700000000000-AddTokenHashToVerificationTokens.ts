import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTokenHashToVerificationTokens1700000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ensure pgcrypto is available for digest()
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    // add token_hash column if missing
    const hasColumn = await queryRunner.hasColumn(
      'verification_tokens',
      'token_hash'
    );
    if (!hasColumn) {
      await queryRunner.query(
        `ALTER TABLE verification_tokens ADD COLUMN token_hash VARCHAR(128)`
      );

      // backfill token_hash with legacy sha256(token) for rows that have token
      // only run backfill if the plaintext `token` column exists (some DBs may already have removed it)
      const hasPlainToken = await queryRunner.hasColumn(
        'verification_tokens',
        'token'
      );
      if (hasPlainToken) {
        // encode(digest(token, 'sha256'), 'hex') produces the hex representation
        await queryRunner.query(
          `UPDATE verification_tokens SET token_hash = encode(digest(token, 'sha256'), 'hex') WHERE token IS NOT NULL`
        );
      }

      await queryRunner.query(
        `CREATE INDEX IF NOT EXISTS idx_verification_tokens_token_hash ON verification_tokens (token_hash)`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // remove token_hash column on down
    const hasColumn = await queryRunner.hasColumn(
      'verification_tokens',
      'token_hash'
    );
    if (hasColumn) {
      await queryRunner.query(
        `ALTER TABLE verification_tokens DROP COLUMN IF EXISTS token_hash`
      );
    }
  }
}
