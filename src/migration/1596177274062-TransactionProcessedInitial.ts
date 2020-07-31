import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionProcessedInitial1596177274062
  implements MigrationInterface {
  name = 'TransactionProcessedInitial1596177274062';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction_processed_entity" ("id" SERIAL NOT NULL, "transaction_id" character varying NOT NULL, "order_object" jsonb NOT NULL, "label_object" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d126c7a98c73c31713d2b4b634" UNIQUE ("transaction_id"), CONSTRAINT "PK_f19d232b5ec5a3d69e95965863b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction_processed_entity"`);
  }
}
