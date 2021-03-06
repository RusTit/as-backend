import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsCreatedController } from './transactions-created.controller';
import { TransactionsCreatedService } from './transactions-created.service';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionCreatedEntity,
      TransactionProcessedEntity,
    ]),
    AuthnetModule,
  ],
  controllers: [TransactionsCreatedController],
  providers: [TransactionsCreatedService],
  exports: [TransactionsCreatedService],
})
export class TransactionsCreatedModule {}
