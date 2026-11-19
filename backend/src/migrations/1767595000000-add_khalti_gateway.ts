import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKhaltiGateway1767595000000 implements MigrationInterface {
  name = 'AddKhaltiGateway1767595000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."orders_paymentmethod_enum" ADD VALUE IF NOT EXISTS 'khalti'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."payment_gateway_enum" ADD VALUE IF NOT EXISTS 'khalti'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment" ALTER COLUMN "gateway" DROP DEFAULT`,
    );
  }
}
