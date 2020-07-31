import { Module } from '@nestjs/common';
import { TransactionsIssuesService } from './transactions-issues.service';

@Module({
  providers: [TransactionsIssuesService],
})
export class TransactionsIssuesModule {}
