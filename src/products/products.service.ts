import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './Product.entity';
import { ProductEditDto, ProductNewDto } from './dtos';
import { DeleteResult } from 'typeorm/index';

function setFieldsFromThePayload(
  dbEntity: ProductEntity,
  productEditDto: ProductNewDto,
) {
  dbEntity.name = productEditDto.name;
  dbEntity.sku = productEditDto.sku;
  dbEntity.weight = productEditDto.weight;
  dbEntity.height = productEditDto.height;
  dbEntity.length = productEditDto.length;
  dbEntity.dimUnits = productEditDto.dimUnits;
  dbEntity.width = productEditDto.width;
  dbEntity.weightUnits = productEditDto.weightUnits;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>,
  ) {}

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
}
