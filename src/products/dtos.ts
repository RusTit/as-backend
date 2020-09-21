import { ApiProperty } from '@nestjs/swagger';
import { DimensionUnits, Units } from './Product.entity';

export class ListProductsQuery {
  @ApiProperty({
    required: false,
    default: 0,
  })
  skip?: number;

  @ApiProperty({
    required: false,
    default: 100,
  })
  take?: number;
}

export class ListGroupingQuery {
  @ApiProperty({
    required: false,
    default: 0,
  })
  skip?: number;

  @ApiProperty({
    required: false,
    default: 100,
  })
  take?: number;
}

export class ProductNewDto {
  @ApiProperty({
    required: true,
  })
  name: string;

  @ApiProperty({
    required: true,
  })
  sku: string;

  @ApiProperty({
    required: false,
  })
  width: number | null;

  @ApiProperty({
    required: false,
  })
  height: number | null;

  @ApiProperty({
    required: false,
  })
  length: number | null;

  @ApiProperty({
    required: false,
    enum: ['inches', 'centimeters'],
  })
  dimUnits: DimensionUnits | null;

  @ApiProperty({
    required: false,
  })
  weight: number | null;

  @ApiProperty({
    required: false,
    enum: ['pounds', 'ounces', 'grams'],
  })
  weightUnits: Units | null;
}

export class ProductEditDto extends ProductNewDto {}

export class ProductDto extends ProductNewDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
