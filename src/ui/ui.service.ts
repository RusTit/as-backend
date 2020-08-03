import { Injectable } from '@nestjs/common';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { TransactionsProcessedService } from '../transactions-processed/transactions-processed.service';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';

@Injectable()
export class UiService {
  constructor(
    private readonly transactionsCreatedService: TransactionsCreatedService,
    private readonly transactionsIssuesService: TransactionsIssuesService,
    private readonly transactionsProcessedService: TransactionsProcessedService,
  ) {}

  async getArrayOfTransactionsCreated(): Promise<TransactionCreatedEntity[]> {
    return this.transactionsCreatedService.findAll();
  }

  async getArrayOfTransactionsProcessed(): Promise<
    TransactionProcessedEntity[]
  > {
    return this.transactionsProcessedService.findAll();
  }

  async getArrayOfTransactionsIssues(): Promise<TransactionIssuesEntity[]> {
    return this.transactionsIssuesService.findAll();
  }
}
