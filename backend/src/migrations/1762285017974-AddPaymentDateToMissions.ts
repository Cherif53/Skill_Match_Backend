import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentDateToMissions1762285017974 implements MigrationInterface {
    name = 'AddPaymentDateToMissions1762285017974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "amountGross" numeric(10,2) NOT NULL, "commission" numeric(10,2) NOT NULL, "payoutToStudent" numeric(10,2) NOT NULL, "paymentDate" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'SUCCESS', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "missionId" integer, "studentId" integer, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "missions" ADD "paymentDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6c3770989418695a4ec0ee39ec3" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_a37b6cb6943f9c6b11dbfe168a0" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_a37b6cb6943f9c6b11dbfe168a0"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6c3770989418695a4ec0ee39ec3"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP COLUMN "paymentDate"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TYPE "public"."transactions_status_enum"`);
    }

}
