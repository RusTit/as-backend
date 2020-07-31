import { Module } from '@nestjs/common';
import { TransactionsProcessedService } from './transactions-processed.service';

@Module({
  providers: [TransactionsProcessedService],
})
export class TransactionsProcessedModule {}
