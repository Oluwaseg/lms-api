import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateParentsChildrenTable1695297604000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS parents_children (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
        child_id UUID REFERENCES users(id) ON DELETE CASCADE,
        relationship VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(parent_id, child_id)
      );

      CREATE INDEX IF NOT EXISTS idx_parents_children_parent_id ON parents_children (parent_id);
      CREATE INDEX IF NOT EXISTS idx_parents_children_child_id ON parents_children (child_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS parents_children;`);
  }
}
