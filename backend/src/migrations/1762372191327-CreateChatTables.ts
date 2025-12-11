import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChatTables1762372191327 implements MigrationInterface {
    name = 'CreateChatTables1762372191327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "roomId"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "missionId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "content" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "senderId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_21f837a58884c2f3479ce8f6de3" FOREIGN KEY ("missionId") REFERENCES "missions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_21f837a58884c2f3479ce8f6de3"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "senderId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "missionId"`);
        await queryRunner.query(`ALTER TABLE "messages" ADD "roomId" integer`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_aaa8a6effc7bd20a1172d3a3bc8" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_2db9cf2b3ca111742793f6c37ce" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
