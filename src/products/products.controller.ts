import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  ListProductsQuery,
  ProductDto,
  ProductNewDto,
  ProductEditDto,
} from './dtos';
import { OperationResultDto } from '../dtos';
import { AuthenticatedGuard } from '../auth/authenticated.guard';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiCookieAuth()
@ApiTags('products')
@UseGuards(AuthenticatedGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query() options?: ListProductsQuery,
  ): Promise<Array<ProductDto>> {
    return this.productsService.findAll(options.skip, options.take);
  }

  @Get(':id')
  async getDetailsByDbId(@Param('id') id: number): Promise<ProductDto> {
    const dbProduct = await this.productsService.getDetailsByDbId(id);
    if (!dbProduct) {
      throw new HttpException(
        `Product not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return dbProduct;
  }

  @Post()
  async createNewProduct(
    @Body() productNewDto: ProductNewDto,
  ): Promise<OperationResultDto> {
    await this.productsService.createNewProduct(productNewDto);
    return {
      message: 'Product created',
    };
  }

  @Post(':id') // todo: this should be put, but for now let's use post
  async updateProduct(
    @Param('id') id: number,
    @Body() productEditDto: ProductEditDto,
  ): Promise<OperationResultDto> {
    const dbProduct = await this.productsService.updateProductData(
      id,
      productEditDto,
    );
    if (!dbProduct) {
      throw new HttpException(
        `Product not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      message: 'Product was updated successfully',
    };
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number): Promise<OperationResultDto> {
    if (!(await this.productsService.deleteProductById(id))) {
      throw new HttpException(
        `Product not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      message: 'Product was successfully delete.',
    };
  }
}
