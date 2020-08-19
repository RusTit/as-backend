import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { WebhookDto, WebhookResultDto } from '../authwebhook/dtos';
import { BigcomhookService } from './bigcomhook.service';

@Controller('bigcomhook')
export class BigcomhookController {
  constructor(private readonly bigcomhookService: BigcomhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebHookRequest(
    @Body() webhookData: WebhookDto,
  ): Promise<WebhookResultDto> {
    Logger.debug('Bigcommerce hook');
    Logger.debug(
      `Webhook type: ${webhookData.eventType} for id: ${webhookData.payload.id}`,
    );
    return { status: 'WebHook was successfully processed' };
  }
}
