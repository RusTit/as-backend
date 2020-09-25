import { ApiProperty } from '@nestjs/swagger';

export class TransactionCreatedResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  transactionId: string;

  @ApiProperty({
    required: false,
  })
  price?: number;

  @ApiProperty({
    required: false,
  })
  customerName?: string;

  @ApiProperty({
    required: false,
  })
  customerEmail?: string;

  @ApiProperty({
    required: false,
  })
  orderNumber?: string;

  @ApiProperty({
    required: false,
  })
  orderDescription?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ListTransactionsQuery {
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
