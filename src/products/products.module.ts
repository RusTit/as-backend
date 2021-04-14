import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './Product.entity';
import { ProductColorSKUEntity } from '../entities/ProductColorSKU.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, ProductColorSKUEntity])],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
