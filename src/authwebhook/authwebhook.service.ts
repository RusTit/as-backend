import { Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';

@Injectable()
export class AuthwebhookService {
  async processWebhookPayload(payload: WebhookDto): Promise<void> {
    Logger.debug(payload);
  }
}
