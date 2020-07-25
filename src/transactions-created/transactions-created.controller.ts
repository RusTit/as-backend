import { Controller, Get, Query } from '@nestjs/common';
import { TransactionsCreatedService } from './transactions-created.service';
import { TransactionCreatedResultDto, ListTransactionsQuery } from './dtos';

@Controller('transactions-created')
export class TransactionsCreatedController {
  constructor(private transactionsCreatedService: TransactionsCreatedService) {}

  @Get()
  async findAll(
    @Query() options?: ListTransactionsQuery,
  ): Promise<Array<TransactionCreatedResultDto>> {
    return this.transactionsCreatedService.findAll(options.skip, options.take);
  }
}
