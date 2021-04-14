import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DimensionUnits, ProductEntity, Units } from './Product.entity';
import { ColorSKUDto, ProductEditDto, ProductNewDto } from './dtos';
import { ApiProperty } from '@nestjs/swagger';
import { ProductColorSKUEntity } from '../entities/ProductColorSKU.entity';

function validationString(value: any): string | null {
  if (typeof value == 'string' && value.trim().length) {
    return value.trim();
  }
  return null;
}

function validationFloat(value: any): number | null {
  if (typeof value == 'string' && value.trim().length) {
    const floatResult = parseFloat(value.trim());
    if (Number.isNaN(floatResult)) {
      return null;
    }
    return floatResult;
  }
  return null;
}

function setFieldsFromThePayload(
  dbEntity: ProductEntity,
  productEditDto: ProductNewDto,
) {
  dbEntity.name = productEditDto.name;
  dbEntity.sku = productEditDto.sku;
  dbEntity.weight = validationFloat(productEditDto.weight);
  dbEntity.height = validationFloat(productEditDto.height);
  dbEntity.length = validationFloat(productEditDto.length);
  dbEntity.dimUnits = validationString(
    productEditDto.dimUnits,
  ) as DimensionUnits;
  dbEntity.width = validationFloat(productEditDto.width);
  dbEntity.weightUnits = validationString(productEditDto.weightUnits) as Units;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>,
    @InjectRepository(ProductColorSKUEntity)
    private readonly productColorSKUEntityRepository: Repository<ProductColorSKUEntity>,
  ) {}

  async findById(id: number): Promise<ProductEntity> {
    return this.productEntityRepository.findOne(id, {
      relations: ['colorSKUEntities'],
    });
  }

  async findAll(skip = 0, take = 100): Promise<ProductEntity[]> {
    return this.productEntityRepository.find({
      skip,
      take,
    });
  }

  async getDetailsByDbId(id: number): Promise<ProductEntity | null> {
    return this.productEntityRepository.findOne(id);
  }

  async createNewProduct(productNewDto: ProductNewDto): Promise<void> {
    const dbNew = new ProductEntity();
    setFieldsFromThePayload(dbNew, productNewDto);
    await this.productEntityRepository.save(dbNew);
  }

  async updateProductData(
    id: number,
    productEditDto: ProductEditDto,
  ): Promise<ProductEntity | null> {
    const dbEntity = await this.productEntityRepository.findOne(id);
    if (!dbEntity) {
      return dbEntity;
    }
    setFieldsFromThePayload(dbEntity, productEditDto);
    await this.productEntityRepository.save(dbEntity);
    return dbEntity;
  }

  async deleteProductById(id: number): Promise<boolean> {
    const dbEntity = await this.productEntityRepository.findOne(id);
    if (!dbEntity) {
      return false;
    }
    await this.productEntityRepository.remove(dbEntity);
    return true;
  }

  async createNewColorSKU(id: number, data: ColorSKUDto): Promise<void> {
    const product = await this.productEntityRepository.findOne(id);
    if (!product) {
      throw new Error(`Product with id: ${id} not found`);
    }
    const newColorSKU = new ProductColorSKUEntity();
    newColorSKU.colorName = data.colorName;
    newColorSKU.colorSKU = data.colorSKU;
    newColorSKU.productEntity = product;
    await this.productColorSKUEntityRepository.save(newColorSKU);
  }

  async deleteColorSKU(id: number): Promise<void> {
    const existingEntity = await this.productColorSKUEntityRepository.findOne(
      id,
    );
    if (!existingEntity) {
      throw new Error(`ColorSKU with this ID is not found: ${id}`);
    }
    await this.productColorSKUEntityRepository.remove(existingEntity);
  }
}
