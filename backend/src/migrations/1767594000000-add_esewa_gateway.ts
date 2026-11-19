import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEsewaGateway1767594000000 implements MigrationInterface {
  name = 'AddEsewaGateway1767594000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."orders_paymentmethod_enum" ADD VALUE IF NOT EXISTS 'esewa'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payment_gateway_enum" AS ENUM('manual', 'esewa')`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment" ADD "gateway" "public"."payment_gateway_enum" NOT NULL DEFAULT 'manual'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "payment" DROP COLUMN "gateway"`);
    await queryRunner.query(`DROP TYPE "public"."payment_gateway_enum"`);
  }
}
