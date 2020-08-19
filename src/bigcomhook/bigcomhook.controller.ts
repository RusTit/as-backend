import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { WebhookResultDto } from '../dtos';
import { BigcomhookService } from './bigcomhook.service';
import { ApiTags } from '@nestjs/swagger';
import { WebhookUpdatedDto } from './dtos';

@Controller('bigcomhook')
@ApiTags('webhook')
export class BigcomhookController {
  constructor(private readonly bigcomhookService: BigcomhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebHookRequest(
    @Body() webhookData: WebhookUpdatedDto,
  ): Promise<WebhookResultDto> {
    Logger.debug('Bigcommerce hook');
    await this.bigcomhookService.handleHook(webhookData);
    return { status: 'WebHook was successfully processed' };
  }
}
