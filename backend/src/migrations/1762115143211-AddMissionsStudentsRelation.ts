import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissionsStudentsRelation1762115143211 implements MigrationInterface {
    name = 'AddMissionsStudentsRelation1762115143211'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "missions_students_users" ("mission_id" integer NOT NULL, "student_id" integer NOT NULL, CONSTRAINT "PK_44617f62ef972b2be8cc16d0df6" PRIMARY KEY ("mission_id", "student_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1a9c2c146792ff2c7e06464aa1" ON "missions_students_users" ("mission_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_51d684d5d3f58742eba1ec4e84" ON "missions_students_users" ("student_id") `);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "studentCount" SET DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "hourlyRate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "totalStudentEarnings" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "platformCommission" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "totalCompanyCost" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions_students_users" ADD CONSTRAINT "FK_1a9c2c146792ff2c7e06464aa1a" FOREIGN KEY ("mission_id") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "missions_students_users" ADD CONSTRAINT "FK_51d684d5d3f58742eba1ec4e84d" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "missions_students_users" DROP CONSTRAINT "FK_51d684d5d3f58742eba1ec4e84d"`);
        await queryRunner.query(`ALTER TABLE "missions_students_users" DROP CONSTRAINT "FK_1a9c2c146792ff2c7e06464aa1a"`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "totalCompanyCost" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "platformCommission" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "totalStudentEarnings" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "hourlyRate" SET DEFAULT '16'`);
        await queryRunner.query(`ALTER TABLE "missions" ALTER COLUMN "studentCount" DROP DEFAULT`);
        await queryRunner.query(`DROP INDEX "public"."IDX_51d684d5d3f58742eba1ec4e84"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a9c2c146792ff2c7e06464aa1"`);
        await queryRunner.query(`DROP TABLE "missions_students_users"`);
    }

}
