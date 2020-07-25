import { Module } from '@nestjs/common';
import { AuthwebhookController } from './authwebhook.controller';
import { AuthwebhookService } from './authwebhook.service';

@Module({
  controllers: [AuthwebhookController],
  providers: [AuthwebhookService],
})
export class AuthwebhookModule {}
