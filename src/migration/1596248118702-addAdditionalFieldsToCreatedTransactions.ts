import { MigrationInterface, QueryRunner } from 'typeorm';

export class addAdditionalFieldsToCreatedTransactions1596248118702
  implements MigrationInterface {
  name = 'addAdditionalFieldsToCreatedTransactions1596248118702';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" ADD "price" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" ADD "customer_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" ADD "customer_email" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" DROP COLUMN "customer_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" DROP COLUMN "customer_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" DROP COLUMN "price"`,
    );
  }
}
