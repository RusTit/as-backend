import { Body, Controller, Post, HttpCode } from '@nestjs/common';
import { WebhookDto, WebhookResultDto } from './dtos';
import { AuthwebhookService } from './authwebhook.service';

@Controller('authwebhook')
export class AuthwebhookController {
  constructor(private authwebhookService: AuthwebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebHookRequest(
    @Body() webhookData: WebhookDto,
  ): Promise<WebhookResultDto> {
    await this.authwebhookService.processWebhookPayload(webhookData);
    return { status: 'WebHook was successfully processed' };
  }
}
