import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInsuranceValueToProducts1613557431832
  implements MigrationInterface {
  name = 'AddInsuranceValueToProducts1613557431832';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_entity" ADD "insuranceValue" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "group_entity" DROP COLUMN "insuranceValue"`,
    );
  }
}
