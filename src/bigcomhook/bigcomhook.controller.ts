import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { WebhookResultDto } from '../authwebhook/dtos';
import { BigcomhookService } from './bigcomhook.service';

@Controller('bigcomhook')
export class BigcomhookController {
  constructor(private readonly bigcomhookService: BigcomhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebHookRequest(
    @Body() webhookData: any,
  ): Promise<WebhookResultDto> {
    Logger.debug('Bigcommerce hook');
    Logger.debug(webhookData);
    return { status: 'WebHook was successfully processed' };
  }
}
