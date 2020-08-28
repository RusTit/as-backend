import { Module } from '@nestjs/common';
import { AuthwebhookController } from './authwebhook.controller';
import { AuthwebhookService } from './authwebhook.service';
import { TransactionsCreatedModule } from '../transactions-created/transactions-created.module';
import { AuthnetModule } from '../authnet/authnet.module';

@Module({
  imports: [TransactionsCreatedModule, AuthnetModule],
  controllers: [AuthwebhookController],
  providers: [AuthwebhookService],
})
export class AuthwebhookModule {}
