import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBackstageTitle1777103856954 implements MigrationInterface {
    name = 'AddBackstageTitle1777103856954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "backstage" ADD "title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "backstage" DROP COLUMN "title"`);
    }

}
