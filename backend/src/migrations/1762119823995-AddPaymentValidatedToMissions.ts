import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentValidatedToMissions1762119823995 implements MigrationInterface {
    name = 'AddPaymentValidatedToMissions1762119823995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."mission_applications_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "mission_applications" ("id" SERIAL NOT NULL, "status" "public"."mission_applications_status_enum" NOT NULL DEFAULT 'PENDING', "appliedAt" TIMESTAMP NOT NULL DEFAULT now(), "missionId" integer, "studentId" integer, CONSTRAINT "UQ_9d3ecc7aa81a03d323b9328e766" UNIQUE ("missionId", "studentId"), CONSTRAINT "PK_f49c6d8228246050eb798e83d34" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "paymentValidated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "mission_applications" ADD CONSTRAINT "FK_aaafc0ffb1bc514baf75407856d" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mission_applications" ADD CONSTRAINT "FK_80fab542605fd207258c6ea8674" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mission_applications" DROP CONSTRAINT "FK_80fab542605fd207258c6ea8674"`);
        await queryRunner.query(`ALTER TABLE "mission_applications" DROP CONSTRAINT "FK_aaafc0ffb1bc514baf75407856d"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "paymentValidated"`);
        await queryRunner.query(`DROP TABLE "mission_applications"`);
        await queryRunner.query(`DROP TYPE "public"."mission_applications_status_enum"`);
    }

}
