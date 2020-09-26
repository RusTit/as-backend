import { Module } from '@nestjs/common';
import { TransactionsIssuesService } from './transactions-issues.service';
import { TransactionsIssuesController } from './transactions-issues.controller';
import { TransactionIssuesEntity } from './TransactionIssues.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsCreatedModule } from '../transactions-created/transactions-created.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionIssuesEntity]),
    AuthnetModule,
    TransactionsCreatedModule,
  ],
  providers: [TransactionsIssuesService],
  controllers: [TransactionsIssuesController],
  exports: [TransactionsIssuesService],
})
export class TransactionsIssuesModule {}
