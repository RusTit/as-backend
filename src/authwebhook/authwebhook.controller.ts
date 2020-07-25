import { Body, Controller, Post } from '@nestjs/common';
import { WebhookDto, WebhookResultResponse } from './dtos';
import { AuthwebhookService } from './authwebhook.service';

@Controller('authwebhook')
export class AuthwebhookController {
  constructor(private authwebhookService: AuthwebhookService) {}

  @Post()
  async handleWebHookRequest(
    @Body() webhookData: WebhookDto,
  ): Promise<WebhookResultResponse> {
    await this.authwebhookService.processWebhookPayload(webhookData);
    return { status: 'WebHook was successfully processed' };
  }
}
