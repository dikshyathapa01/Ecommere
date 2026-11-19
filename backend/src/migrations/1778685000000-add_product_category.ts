import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductCategory1778685000000 implements MigrationInterface {
  name = 'AddProductCategory1778685000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD "category" character varying NOT NULL DEFAULT 'electronics'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "category"`);
  }
}
