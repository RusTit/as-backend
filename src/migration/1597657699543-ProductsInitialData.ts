import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  DimensionUnits,
  ProductEntity,
  Units,
} from '../products/Product.entity';

const data = [
  {
    name: '1791 Flag (Premium Edition)',
    sku: '1791WHISKEYREBEL',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: '1791 Flag Big',
    sku: '1791MAX',
    width: 44,
    height: 25,
    length: 7,
    dimUnits: 'inches',
    weight: 25,
    weightUnits: 'pounds',
  },
  {
    name: '2nd Patriot 35S',
    sku: 'PATRIOT35O',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: '2nd Patriot 35S compact',
    sku: 'PATRIOT35C',
    width: 26,
    height: 14,
    length: 6,
    dimUnits: 'inches',
    weight: 9,
    weightUnits: 'pounds',
  },
  {
    name: 'Barrel Head',
    sku: 'TACTICALBARREL',
    width: 28,
    height: 28,
    length: 12,
    dimUnits: 'inches',
    weight: 30,
    weightUnits: 'pounds',
  },
  {
    name: 'Freedom 52R',
    sku: 'FREEDOM52R',
    width: 50,
    height: 17,
    length: 7,
    dimUnits: 'inches',
    weight: 17,
    weightUnits: 'pounds',
  },
  {
    name: 'Freedom 52R (2.0)',
    sku: 'FREEDOM52R',
    width: 50,
    height: 17,
    length: 7,
    dimUnits: 'inches',
    weight: 17,
    weightUnits: 'pounds',
  },
  {
    name: 'Liberty 35S',
    sku: 'LIBERTY35',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 15,
    weightUnits: 'pounds',
  },
  {
    name: 'Patriot 35S',
    sku: 'PATRIOT35C',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'Special Edition TT Patriot (RFID)',
    sku: 'PATRIOT35O',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'Tactical Rack',
    sku: 'RACK',
    width: 40,
    height: 19,
    length: 9,
    dimUnits: 'inches',
    weight: 16,
    weightUnits: 'pounds',
  },
  {
    name: 'TT 4laws Flag',
    sku: '4LAWSTACTICALFLAG',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Defender',
    sku: 'DEFENDER45',
    width: 50,
    height: 17,
    length: 7,
    dimUnits: 'inches',
    weight: 19,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Endtable',
    sku: 'TACTICALTABLE',
    width: 29,
    height: 28,
    length: 13,
    dimUnits: 'inches',
    weight: 34,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Flag',
    sku: 'STANDARDFLAG',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Flag - Specialoffer',
    sku: 'STANDARDFLAG',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Flag 1791',
    sku: '1791WHISKEYREBEL',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Flag Blueline',
    sku: 'BLUELINEFLAG',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Flag Upgrade',
    sku: 'STANDARDFLAG',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Freedom',
    sku: 'FREEDOM52R',
    width: 50,
    height: 17,
    length: 7,
    dimUnits: 'inches',
    weight: 17,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Freedom 52',
    sku: 'FREEDOM52R',
    width: 50,
    height: 17,
    length: 7,
    dimUnits: 'inches',
    weight: 17,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Freedom DSC',
    sku: 'FREEDOM52R',
    width: 50,
    height: 17,
    length: 7,
    dimUnits: 'inches',
    weight: 17,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Liberty',
    sku: 'LIBERTY35',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 15,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Liberty DSC',
    sku: 'LIBERTY35',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 15,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Liberty Rustic Edition',
    sku: 'LIBERTY35',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 15,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot',
    sku: 'PATRIOT35O',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot - Scratch and Dent',
    sku: 'PATRIOT35O',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot (RFID)',
    sku: 'PATRIOT35O',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot 19S',
    sku: 'PATRIOT35C',
    width: 26,
    height: 14,
    length: 6,
    dimUnits: 'inches',
    weight: 9,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot 35S (RFID)',
    sku: 'PATRIOT35O',
    width: 26,
    height: 14,
    length: 6,
    dimUnits: 'inches',
    weight: 9,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot 35S COmpact (RFID)',
    sku: 'PATRIOT35C',
    width: 26,
    height: 14,
    length: 6,
    dimUnits: 'inches',
    weight: 9,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot 35S COmpact (RFID) (elite)',
    sku: 'COMPACTBLUETOOTH',
    width: 26,
    height: 14,
    length: 6,
    dimUnits: 'inches',
    weight: 9,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot Compact (RFID)',
    sku: 'PATRIOT35C',
    width: 26,
    height: 14,
    length: 6,
    dimUnits: 'inches',
    weight: 9,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Patriot DSC',
    sku: 'PATRIOT35O',
    width: 40,
    height: 13,
    length: 7,
    dimUnits: 'inches',
    weight: 11,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Saver',
    sku: 'CADDY',
    width: 13,
    height: 10,
    length: 9,
    dimUnits: 'inches',
    weight: 3,
    weightUnits: 'pounds',
  },
  {
    name: 'Raptor Watch',
    sku: 'RAPTORWATCH',
    width: 6,
    height: 6,
    length: 4,
    dimUnits: 'inches',
    weight: 1,
    weightUnits: 'pounds',
  },
  {
    name: 'Sealion Watch',
    sku: 'SEALIONDIVEWATCH',
    width: 6,
    height: 6,
    length: 4,
    dimUnits: 'inches',
    weight: 1,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Guardian Frame',
    sku: 'GUARDIAN',
    width: 29,
    height: 19,
    length: 7,
    dimUnits: 'inches',
    weight: 8,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Arcticstorm',
    sku: 'TTArcticstorm',
    width: 6,
    height: 6,
    length: 4,
    dimUnits: 'inches',
    weight: 1,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Stealth X7 Camera- 1pk',
    sku: 'STEALTHX7',
    width: 4,
    height: 4,
    length: 8,
    dimUnits: 'inches',
    weight: 1,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Stealth X7 Camera Deluxe- 2pk',
    sku: 'STEALTHX7',
    width: 10,
    height: 8,
    length: 4,
    dimUnits: 'inches',
    weight: 2,
    weightUnits: 'pounds',
  },
  {
    name: 'TT Stealth X7 Camera Home Fortress- 4pk',
    sku: 'STEALTHX7',
    width: 12,
    height: 9,
    length: 8,
    dimUnits: 'inches',
    weight: 4,
    weightUnits: 'pounds',
  },
  {
    name: 'Compact Upgrade',
    sku: 'UPGRADEDCOMPACT',
  },
  {
    name: 'Hardwood',
    sku: 'HARDWOOD',
  },
];

export class ProductsInitialData1597657699543 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    const entities = [];
    for (const rawData of data) {
      const dbNew = new ProductEntity();
      dbNew.name = rawData.name;
      dbNew.sku = rawData.sku;
      dbNew.width = rawData.width;
      dbNew.height = rawData.height;
      dbNew.length = rawData.length;
      dbNew.dimUnits = rawData.dimUnits as DimensionUnits;
      dbNew.weight = rawData.weight;
      dbNew.weightUnits = rawData.weightUnits as Units;
      entities.push(dbNew);
    }
    await manager.save(entities);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const manager = queryRunner.manager;
    for (const rawData of data) {
      await manager.delete(ProductEntity, {
        where: {
          name: rawData.name,
        },
      });
      // return queryRunner.clearTable('product_entity');
    }
  }
}
