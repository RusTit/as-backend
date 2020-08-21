import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { TransactionsCreatedService } from './transactions-created.service';
import { TransactionCreatedResultDto, ListTransactionsQuery } from './dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
