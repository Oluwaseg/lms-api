import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParentsChildrenTable1695297604000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS parents_children (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        relationship VARCHAR(32), -- e.g. 'father', 'mother', 'guardian', etc.
        status VARCHAR(32) DEFAULT 'pending', -- pending | accepted | rejected
        invitation_code VARCHAR(64), -- for when parent invites child via email/code
        invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        accepted_at TIMESTAMP,
        rejected_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_id, child_id)
      );

      CREATE INDEX IF NOT EXISTS idx_parents_children_parent_id ON parents_children (parent_id);
      CREATE INDEX IF NOT EXISTS idx_parents_children_child_id ON parents_children (child_id);
      CREATE INDEX IF NOT EXISTS idx_parents_children_status ON parents_children (status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS parents_children;`);
  }
}
