import { MigrationInterface, QueryRunner } from 'typeorm';

export class SystemHealth1600592616371 implements MigrationInterface {
  name = 'SystemHealth1600592616371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "system_health_entity" ("id" SERIAL NOT NULL, "message" character varying(512) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3e1d982b8c7d9064d50d02c32b" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "system_health_entity"`);
  }
}
