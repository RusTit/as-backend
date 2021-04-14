import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import { ProductEntity } from '../products/Product.entity';

@Entity()
export class ProductColorSKUEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false,
  })
  colorName: string;

  @Column({
    nullable: false,
  })
  colorSKU: string;

  @ManyToOne(() => ProductEntity, (product) => product.colorSKUEntities)
  productEntity!: ProductEntity;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;
}
