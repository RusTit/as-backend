import { Module } from '@nestjs/common';
import { BigcomhookService } from './bigcomhook.service';
import { BigcomhookController } from './bigcomhook.controller';

@Module({
  providers: [BigcomhookService],
  controllers: [BigcomhookController],
})
export class BigcomhookModule {}
