import { ApiProperty } from '@nestjs/swagger';

export class TransactionIssuesResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  issueObject: any;

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
