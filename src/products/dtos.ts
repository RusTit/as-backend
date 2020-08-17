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
  })
  dimUnits: DimensionUnits | null;

  @ApiProperty({
    required: false,
  })
  weight: number | null;

  @ApiProperty({
    required: false,
  })
  weightUnits: Units | null;
}

export class ProductEditDto extends ProductNewDto {}

export class ProductDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  width: number | null;

  @ApiProperty()
  height: number | null;

  @ApiProperty()
  length: number | null;

  @ApiProperty()
  dimUnits: DimensionUnits | null;

  @ApiProperty()
  weight: number | null;

  @ApiProperty()
  weightUnits: Units | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
