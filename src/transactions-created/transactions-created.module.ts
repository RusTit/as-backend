import { Module } from '@nestjs/common';
import { TransactionsCreatedController } from './transactions-created.controller';
import { TransactionsCreatedService } from './transactions-created.service';

@Module({
  controllers: [TransactionsCreatedController],
  providers: [TransactionsCreatedService],
})
export class TransactionsCreatedModule {}
