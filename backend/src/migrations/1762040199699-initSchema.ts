import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1762040199699 implements MigrationInterface {
    name = 'InitSchema1762040199699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."documents_type_enum" AS ENUM('SCHOOL_CERTIFICATE', 'RESIDENCE_PERMIT', 'AUTO_ENTREPRENEUR', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" SERIAL NOT NULL, "type" "public"."documents_type_enum" NOT NULL DEFAULT 'OTHER', "name" character varying NOT NULL, "url" character varying NOT NULL, "status" "public"."documents_status_enum" NOT NULL DEFAULT 'PENDING', "comment" character varying, "reviewComment" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."missions_status_enum" AS ENUM('PENDING', 'STAFFED', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "missions" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "location" character varying NOT NULL, "date" date NOT NULL, "startHour" character varying NOT NULL, "endHour" character varying NOT NULL, "studentCount" integer NOT NULL, "hourlyRate" numeric(10,2) NOT NULL DEFAULT '16', "totalStudentEarnings" numeric(10,2), "platformCommission" numeric(10,2), "totalCompanyCost" numeric(10,2), "status" "public"."missions_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "companyId" integer, CONSTRAINT "PK_787aebb1ac5923c9904043c6309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('STUDENT', 'COMPANY', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'STUDENT', "isActive" boolean NOT NULL DEFAULT true, "refreshTokenHash" text, "lastLogin" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "missions_assigned_students_users" ("missionsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_70616ba8576317d49912d1b11aa" PRIMARY KEY ("missionsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ef46e2bc47feaae8a293a03924" ON "missions_assigned_students_users" ("missionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f7f5d5aa8e0e0d75e887ccc303" ON "missions_assigned_students_users" ("usersId") `);
        await queryRunner.query(`CREATE TABLE "missions_applicants_users" ("missionsId" integer NOT NULL, "usersId" integer NOT NULL, CONSTRAINT "PK_fa013162fca2733e981c0b5c834" PRIMARY KEY ("missionsId", "usersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d46958547f30de6aa2e7b9beed" ON "missions_applicants_users" ("missionsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_161a40c35148ca076be0b433b4" ON "missions_applicants_users" ("usersId") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "missions" ADD CONSTRAINT "FK_44a84f63375925e5e842f8be767" FOREIGN KEY ("companyId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "missions_assigned_students_users" ADD CONSTRAINT "FK_ef46e2bc47feaae8a293a039243" FOREIGN KEY ("missionsId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "missions_assigned_students_users" ADD CONSTRAINT "FK_f7f5d5aa8e0e0d75e887ccc3036" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "missions_applicants_users" ADD CONSTRAINT "FK_d46958547f30de6aa2e7b9beedc" FOREIGN KEY ("missionsId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "missions_applicants_users" ADD CONSTRAINT "FK_161a40c35148ca076be0b433b4f" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "missions_applicants_users" DROP CONSTRAINT "FK_161a40c35148ca076be0b433b4f"`);
        await queryRunner.query(`ALTER TABLE "missions_applicants_users" DROP CONSTRAINT "FK_d46958547f30de6aa2e7b9beedc"`);
        await queryRunner.query(`ALTER TABLE "missions_assigned_students_users" DROP CONSTRAINT "FK_f7f5d5aa8e0e0d75e887ccc3036"`);
        await queryRunner.query(`ALTER TABLE "missions_assigned_students_users" DROP CONSTRAINT "FK_ef46e2bc47feaae8a293a039243"`);
        await queryRunner.query(`ALTER TABLE "missions" DROP CONSTRAINT "FK_44a84f63375925e5e842f8be767"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT "FK_e300b5c2e3fefa9d6f8a3f25975"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_161a40c35148ca076be0b433b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d46958547f30de6aa2e7b9beed"`);
        await queryRunner.query(`DROP TABLE "missions_applicants_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7f5d5aa8e0e0d75e887ccc303"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef46e2bc47feaae8a293a03924"`);
        await queryRunner.query(`DROP TABLE "missions_assigned_students_users"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "missions"`);
        await queryRunner.query(`DROP TYPE "public"."missions_status_enum"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."documents_type_enum"`);
    }

}
