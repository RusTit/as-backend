import { Controller, Post } from '@nestjs/common';

@Controller('authwebhook')
export class AuthwebhookController {
  @Post()
  handleWebHookRequest(): string {
    return '';
  }
}
