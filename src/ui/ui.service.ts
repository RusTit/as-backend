import { Injectable } from '@nestjs/common';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { TransactionsProcessedService } from '../transactions-processed/transactions-processed.service';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { ListTransactionsQuery } from './dtos';

@Injectable()
export class UiService {
  constructor(
    private readonly transactionsCreatedService: TransactionsCreatedService,
    private readonly transactionsIssuesService: TransactionsIssuesService,
    private readonly transactionsProcessedService: TransactionsProcessedService,
  ) {}

  async getArrayOfTransactionsCreated(
    options?: ListTransactionsQuery,
  ): Promise<TransactionCreatedEntity[]> {
    return this.transactionsCreatedService.findAll(options.skip, options.take);
  }

  async getArrayOfTransactionsProcessed(
    options?: ListTransactionsQuery,
  ): Promise<TransactionProcessedEntity[]> {
    return this.transactionsProcessedService.findAll(
      options.skip,
      options.take,
    );
  }

  async getArrayOfTransactionsIssues(
    options?: ListTransactionsQuery,
  ): Promise<TransactionIssuesEntity[]> {
    return this.transactionsIssuesService.findAll(options.skip, options.take);
  }
}
