import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShowSortOrder1777099164216 implements MigrationInterface {
    name = 'AddShowSortOrder1777099164216'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "show" ADD "sortOrder" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "show" DROP COLUMN "sortOrder"`);
    }

}
