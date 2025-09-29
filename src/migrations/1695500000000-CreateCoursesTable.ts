import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoursesTable1695500000000 implements MigrationInterface {
  name = 'CreateCoursesTable1695500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "courses" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "title" character varying(255) NOT NULL,
      "description" text,
      "price_cents" bigint NOT NULL DEFAULT '0',
      "currency" character varying(8) NOT NULL DEFAULT 'USD',
      "is_paid" boolean NOT NULL DEFAULT false,
      "instructor_id" uuid NOT NULL,
      "status" character varying(32) NOT NULL DEFAULT 'draft',
      "published_at" TIMESTAMP,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_courses_id" PRIMARY KEY ("id")
    );`);

    await queryRunner.query(
      `ALTER TABLE "courses" ADD CONSTRAINT "FK_courses_instructor" FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" DROP CONSTRAINT "FK_courses_instructor";`
    );
    await queryRunner.query(`DROP TABLE "courses";`);
  }
}
