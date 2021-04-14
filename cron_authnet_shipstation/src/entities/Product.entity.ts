import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { ProductColorSKUEntity } from './ProductColorSKU.entity';

export type DimensionUnits = 'inches' | 'centimeters';

export type Units = 'pounds' | 'ounces' | 'grams';

@Entity()
@Unique(['name'])
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    nullable: false,
  })
  name!: string;

  @Column({
    nullable: false,
  })
  sku!: string;

  @Column({
    type: 'float',
    nullable: true,
  })
  width!: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  height!: number;

  @Column({
    type: 'float',
    nullable: true,
  })
  length!: number;

  @Column({
    type: 'enum',
    enum: ['inches', 'centimeters'],
    nullable: true,
  })
  dimUnits!: DimensionUnits;

  @Column({
    type: 'float',
    nullable: true,
  })
  weight!: number;

  @Column({
    type: 'enum',
    enum: ['pounds', 'ounces', 'grams'],
    nullable: true,
  })
  weightUnits!: Units;

  @OneToMany(
    () => ProductColorSKUEntity,
    (productColorSku) => productColorSku.productEntity,
    {
      cascade: ['insert', 'update', 'remove', 'recover', 'soft-remove'],
    },
  )
  colorSKUEntities!: ProductColorSKUEntity[];

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt!: Date;
}
