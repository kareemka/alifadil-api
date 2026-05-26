import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsSlug1779720000000 implements MigrationInterface {
  name = 'AddNewsSlug1779720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "slug" character varying`,
    );

    await queryRunner.query(`
      UPDATE "news"
      SET "slug" = 'خبر-' || "id"::text
      WHERE "slug" IS NULL OR TRIM("slug") = ''
    `);

    await queryRunner.query(`
      ALTER TABLE "news" ALTER COLUMN "slug" SET NOT NULL
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_news_slug" ON "news" ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_news_slug"`);
    await queryRunner.query(`ALTER TABLE "news" DROP COLUMN IF EXISTS "slug"`);
  }
}
