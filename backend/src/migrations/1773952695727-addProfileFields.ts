import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileFields1773952695727 implements MigrationInterface {
    name = 'AddProfileFields1773952695727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "website" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "website"`);
    }

}
