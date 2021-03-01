import { Module } from '@nestjs/common';
import { AuthwebhookController } from './authwebhook.controller';
import { AuthwebhookService } from './authwebhook.service';
import { TransactionsCreatedModule } from '../transactions-created/transactions-created.module';
import { AuthnetModule } from '../authnet/authnet.module';
import { BigcomhookModule } from '../bigcomhook/bigcomhook.module';
import { TransactionsIssuesModule } from '../transactions-issues/transactions-issues.module';
import { HookmutextModule } from '../hookmutext/hookmutext.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';

@Module({
  imports: [
    TransactionsCreatedModule,
    AuthnetModule,
    BigcomhookModule,
    TransactionsIssuesModule,
    HookmutextModule,
    TypeOrmModule.forFeature([TransactionProcessedEntity]),
  ],
  controllers: [AuthwebhookController],
  providers: [AuthwebhookService],
})
export class AuthwebhookModule {}
