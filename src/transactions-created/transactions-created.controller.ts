import { Controller, Get, Query, Param } from '@nestjs/common';
import { TransactionsCreatedService } from './transactions-created.service';
import { TransactionCreatedResultDto, ListTransactionsQuery } from './dtos';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions-created')
export class TransactionsCreatedController {
  constructor(
    private readonly transactionsCreatedService: TransactionsCreatedService,
  ) {}

  @Get()
  async findAll(
    @Query() options?: ListTransactionsQuery,
  ): Promise<Array<TransactionCreatedResultDto>> {
    return this.transactionsCreatedService.findAll(options.skip, options.take);
  }

  @Get(':id')
  async getDetailsByDbId(@Param('id') id: number): Promise<any> {
    return this.transactionsCreatedService.getDetailsByDbId(id);
  }
}
