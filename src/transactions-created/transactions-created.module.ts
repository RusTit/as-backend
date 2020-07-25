import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsCreatedController } from './transactions-created.controller';
import { TransactionsCreatedService } from './transactions-created.service';
import { TransactionCreatedEntity } from './TransactionCreated.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionCreatedEntity])],
  controllers: [TransactionsCreatedController],
  providers: [TransactionsCreatedService],
  exports: [TransactionsCreatedService],
})
export class TransactionsCreatedModule {}
