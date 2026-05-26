import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShowDetailsColumns1779716000000 implements MigrationInterface {
  name = 'AddShowDetailsColumns1779716000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "meta" character varying`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "synopsis" text`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "director" character varying`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "writer" character varying`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "dop" character varying`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "music" character varying`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "editor" character varying`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "cast" text`);
    await queryRunner.query(`ALTER TABLE "show" ADD COLUMN IF NOT EXISTS "stills" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "stills"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "cast"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "editor"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "music"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "dop"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "writer"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "director"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "synopsis"`);
    await queryRunner.query(`ALTER TABLE "show" DROP COLUMN IF EXISTS "meta"`);
  }
}
