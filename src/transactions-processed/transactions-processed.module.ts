import { Module } from '@nestjs/common';
import { TransactionsProcessedService } from './transactions-processed.service';
import { TransactionsProcessedController } from './transactions-processed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionProcessedEntity } from './TransactionProcessed.entity';
import { AuthnetModule } from '../authnet/authnet.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionProcessedEntity]),
    AuthnetModule,
  ],
  providers: [TransactionsProcessedService],
  controllers: [TransactionsProcessedController],
  exports: [TransactionsProcessedService],
})
export class TransactionsProcessedModule {}
