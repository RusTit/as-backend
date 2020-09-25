import { MigrationInterface, QueryRunner } from 'typeorm';

export class extentTransactionCreated1601023195424
  implements MigrationInterface {
  name = 'extentTransactionCreated1601023195424';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" ADD "order_number" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" ADD "order_description" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" DROP COLUMN "order_description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction_created_entity" DROP COLUMN "order_number"`,
    );
  }
}
