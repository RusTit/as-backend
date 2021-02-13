import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInsuranceValueToProducts1613212893635
  implements MigrationInterface {
  name = 'AddInsuranceValueToProducts1613212893635';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_entity" ADD "insuranceValue" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_entity" DROP COLUMN "insuranceValue"`,
    );
  }
}
