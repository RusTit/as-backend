import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransactionsIssuesService } from './transactions-issues.service';
import { ListTransactionsQuery, TransactionIssuesResultDto } from './dtos';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('transactions-issues')
export class TransactionsIssuesController {
  constructor(
    private readonly transactionsIssuesService: TransactionsIssuesService,
  ) {}

  @Get()
  async findAll(
    @Query() options?: ListTransactionsQuery,
  ): Promise<Array<TransactionIssuesResultDto>> {
    return this.transactionsIssuesService.findAll(options.skip, options.take);
  }

  @Get(':id')
  async getDetailsByDbId(@Param('id') id: number): Promise<any> {
    return this.transactionsIssuesService.getDetailsByDbId(id);
  }
}
