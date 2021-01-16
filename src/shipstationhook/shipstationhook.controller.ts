import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ShipstationhookService } from './shipstationhook.service';
import { ApiTags } from '@nestjs/swagger';
import { HookmutextService } from '../hookmutext/hookmutext.service';
import { WebhookResultDto } from '../dtos';
import { WebHookPayload } from './dtos';

@Controller('shipstationhook')
@ApiTags('webhook')
export class ShipstationhookController {
  constructor(
    private readonly shipstationhookService: ShipstationhookService,
    private readonly mutex: HookmutextService,
  ) {}

  @Post()
  @HttpCode(200)
  async handleWebHookRequest(
    @Body() webhookData: WebHookPayload,
  ): Promise<WebhookResultDto> {
    Logger.debug('Ship Station hook');
    await this.mutex.getMutex().schedule(async () => {
      return this.shipstationhookService.handleWebHook(webhookData);
    });
    return { status: 'WebHook was successfully processed' };
  }
}
