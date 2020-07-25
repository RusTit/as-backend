import { ApiProperty } from '@nestjs/swagger';

export class TransactionCreatedResultDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  transactionId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
