import { ApiProperty } from '@nestjs/swagger';

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

export class GroupNewDto {
  @ApiProperty({
    required: true,
  })
  name: string;

  @ApiProperty({
    required: true,
  })
  productNameGlob: string;

  @ApiProperty({
    required: true,
  })
  productSkuGlob: string;

  @ApiProperty({
    required: false,
  })
  customName?: string;

  @ApiProperty({
    required: false,
  })
  fieldName?: string;
}
