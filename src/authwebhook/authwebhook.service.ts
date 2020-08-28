import { Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';

@Injectable()
export class AuthwebhookService {
  constructor(private transactionsCreatedService: TransactionsCreatedService) {}

  async processWebhookPayload(payload: WebhookDto): Promise<void> {
    Logger.debug(payload);
    switch (payload.eventType) {
      case 'net.authorize.payment.authcapture.created':
      case 'net.authorize.payment.capture.created':
        await this.transactionsCreatedService.createNew(payload.payload.id);
        break;
      case 'net.authorize.payment.refund.created':
      case 'net.authorize.payment.void.created':
        break;
    }
  }
}
