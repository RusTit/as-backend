import { Controller, Get, Query } from '@nestjs/common';
import { TransactionsCreatedService } from './transactions-created.service';
import { TransactionCreatedResultDto } from './dtos';

@Controller('transactions-created')
export class TransactionsCreatedController {
  constructor(private transactionsCreatedService: TransactionsCreatedService) {}

  @Get()
  async findAll(
    @Query() skip?: number,
    @Query() take?: number,
  ): Promise<Array<TransactionCreatedResultDto>> {
    return this.transactionsCreatedService.findAll();
  }
}
