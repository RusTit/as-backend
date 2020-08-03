import { Module } from '@nestjs/common';
import { TransactionsIssuesService } from './transactions-issues.service';
import { TransactionsIssuesController } from './transactions-issues.controller';
import { TransactionIssuesEntity } from './TransactionIssues.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionIssuesEntity]), AuthnetModule],
  providers: [TransactionsIssuesService],
  controllers: [TransactionsIssuesController],
  exports: [TransactionsIssuesService],
})
export class TransactionsIssuesModule {}
