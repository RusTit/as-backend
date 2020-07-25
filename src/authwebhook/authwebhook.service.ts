import { Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';

@Injectable()
export class AuthwebhookService {
  constructor(private transactionsCreatedService: TransactionsCreatedService) {}

  async processWebhookPayload(payload: WebhookDto): Promise<void> {
    Logger.debug(payload);
    await this.transactionsCreatedService.createNew(payload.payload.id);
  }
}
