import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLessonsAndEnrollments1695500100000
  implements MigrationInterface
{
  name = 'CreateLessonsAndEnrollments1695500100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "lessons" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "course_id" uuid NOT NULL,
      "title" character varying(255) NOT NULL,
      "content" text,
      "position" integer NOT NULL DEFAULT 0,
      "duration_seconds" integer NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_lessons_id" PRIMARY KEY ("id")
    );`);

    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_lessons_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;`
    );

    await queryRunner.query(`CREATE TABLE "enrollments" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "student_id" uuid NOT NULL,
      "course_id" uuid NOT NULL,
      "payment_status" character varying(32) NOT NULL DEFAULT 'free',
      "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_enrollments_id" PRIMARY KEY ("id")
    );`);

    await queryRunner.query(
      `ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_student" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE;`
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" ADD CONSTRAINT "FK_enrollments_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_course";`
    );
    await queryRunner.query(
      `ALTER TABLE "enrollments" DROP CONSTRAINT "FK_enrollments_student";`
    );
    await queryRunner.query(`DROP TABLE "enrollments";`);
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_lessons_course";`
    );
    await queryRunner.query(`DROP TABLE "lessons";`);
  }
}
