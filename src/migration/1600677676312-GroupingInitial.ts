import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupingInitial1600677676312 implements MigrationInterface {
  name = 'GroupingInitial1600677676312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "group_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "productNameGlob" character varying NOT NULL, "productSkuGlob" character varying NOT NULL, "customName" character varying, "fieldName" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d074114199e1996b57b04ac77ba" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "group_entity"`);
  }
}
