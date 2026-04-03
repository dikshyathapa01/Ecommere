import { MigrationInterface, QueryRunner } from "typeorm";

export class IndexOnProduct1767592927082 implements MigrationInterface {
    name = 'IndexOnProduct1767592927082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_151b79a83ba240b0cb31b2302d" ON "orders" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_151b79a83ba240b0cb31b2302d"`);
    }

}
