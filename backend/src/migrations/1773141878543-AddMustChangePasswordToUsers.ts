import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMustChangePasswordToUsers1773141878543 implements MigrationInterface {
    name = 'AddMustChangePasswordToUsers1773141878543'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "mustChangePassword" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "mustChangePassword"`);
    }

}
