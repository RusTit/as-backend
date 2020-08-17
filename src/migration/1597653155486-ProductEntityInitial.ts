import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductEntityInitial1597653155486 implements MigrationInterface {
  name = 'ProductEntityInitial1597653155486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "product_entity_dimunits_enum" AS ENUM('inches', 'centimeters')`,
    );
    await queryRunner.query(
      `CREATE TYPE "product_entity_weightunits_enum" AS ENUM('pounds', 'ounces', 'grams')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "sku" character varying NOT NULL, "width" double precision, "height" double precision, "length" double precision, "dimUnits" "product_entity_dimunits_enum", "weight" double precision, "weightUnits" "product_entity_weightunits_enum", "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_ebbac2bbbf7cb3bbec225dcf1e1" UNIQUE ("name"), CONSTRAINT "PK_6e8f75045ddcd1c389c765c896e" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_entity"`);
    await queryRunner.query(`DROP TYPE "product_entity_weightunits_enum"`);
    await queryRunner.query(`DROP TYPE "product_entity_dimunits_enum"`);
  }
}
