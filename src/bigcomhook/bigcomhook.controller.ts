import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { WebhookResultDto } from '../dtos';
import { BigcomhookService } from './bigcomhook.service';
import { ApiTags } from '@nestjs/swagger';
import { WebhookUpdatedDto } from './dtos';
import { HookmutextService } from '../hookmutext/hookmutext.service';

@Controller('bigcomhook')
@ApiTags('webhook')
export class BigcomhookController {
  constructor(
    private readonly bigcomhookService: BigcomhookService,
    private readonly mutex: HookmutextService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebHookRequest(
    @Body() webhookData: WebhookUpdatedDto,
  ): Promise<WebhookResultDto> {
    Logger.debug('Bigcommerce hook');
    await this.mutex.getMutex().schedule(async () => {
      return this.bigcomhookService.handleHook(webhookData);
    });
    return { status: 'WebHook was successfully processed' };
  }
}
