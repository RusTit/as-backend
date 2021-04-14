import { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductColorSKU1618390663661 implements MigrationInterface {
  name = 'ProductColorSKU1618390663661';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "product_color_sku_entity" ("id" SERIAL NOT NULL, "colorName" character varying NOT NULL, "colorSKU" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productEntityId" integer, CONSTRAINT "PK_57305722fe46ec8d642e61eb441" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_color_sku_entity" ADD CONSTRAINT "FK_192fa31d9fa8f7ac8c1b4d68179" FOREIGN KEY ("productEntityId") REFERENCES "product_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_color_sku_entity" DROP CONSTRAINT "FK_192fa31d9fa8f7ac8c1b4d68179"`,
    );
    await queryRunner.query(`DROP TABLE "product_color_sku_entity"`);
  }
}
