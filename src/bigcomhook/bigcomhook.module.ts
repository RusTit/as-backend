import { Module } from '@nestjs/common';
import { BigcomhookService } from './bigcomhook.service';
import { BigcomhookController } from './bigcomhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionProcessedEntity,
      TransactionIssuesEntity,
    ]),
  ],
  providers: [BigcomhookService],
  controllers: [BigcomhookController],
})
export class BigcomhookModule {}
