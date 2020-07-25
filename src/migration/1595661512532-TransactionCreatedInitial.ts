import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionCreatedInitial1595661512532
  implements MigrationInterface {
  name = 'TransactionCreatedInitial1595661512532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction_created_entity" ("id" SERIAL NOT NULL, "transaction_id" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e0c6919e372c8f68634693ca342" UNIQUE ("transaction_id"), CONSTRAINT "PK_fa68679aa1449da9dd984a618b3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction_created_entity"`);
  }
}
