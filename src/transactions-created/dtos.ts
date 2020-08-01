import { ApiProperty } from '@nestjs/swagger';

export class TransactionCreatedResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  transactionId: string;

  @ApiProperty({
    required: false,
  })
  price: number | null;

  @ApiProperty({
    required: false,
  })
  customerName: string | null;

  @ApiProperty({
    required: false,
  })
  customerEmail: string | null;

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
