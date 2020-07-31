import { MigrationInterface, QueryRunner } from 'typeorm';

export class TransactionIssuesInitial1596181428352
  implements MigrationInterface {
  name = 'TransactionIssuesInitial1596181428352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "transaction_issues_entity" ("id" SERIAL NOT NULL, "transaction_id" character varying NOT NULL, "issue_object" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_bfae9ffae023231a74b25384ccd" UNIQUE ("transaction_id"), CONSTRAINT "PK_629d467a1aba20132b255cf7770" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transaction_issues_entity"`);
  }
}
