import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsProcessedService } from './transactions-processed.service';
import { ListTransactionsQuery, TransactionProcessedResultDto } from './dtos';

@Controller('transactions-processed')
export class TransactionsProcessedController {
  constructor(
    private readonly transactionsProcessedService: TransactionsProcessedService,
  ) {}

  @Get()
  async findAll(
    @Query() options?: ListTransactionsQuery,
  ): Promise<Array<TransactionProcessedResultDto>> {
    return this.transactionsProcessedService.findAll(
      options.skip,
      options.take,
    );
  }

  @Get(':id')
  async getDetailsByDbId(@Param('id') id: number): Promise<any> {
    return this.transactionsProcessedService.getDetailsByDbId(id);
  }
}
