import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TransactionsIssuesService } from './transactions-issues.service';
import { ListTransactionsQuery, TransactionIssuesResultDto } from './dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiTags('transactions')
@UseGuards(AuthenticatedGuard)
@ApiBearerAuth()
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

  @Delete(':id')
  async deleteTransaction(@Param('id') id: number): Promise<any> {
    return this.transactionsIssuesService.deleteTransactionById(id);
  }

  @Get('/restore/:id')
  async restoreTransaction(@Param('id') id: number): Promise<any> {
    await this.transactionsIssuesService.restoreTransactionById(id);
  }
}
