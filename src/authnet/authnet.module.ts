import { Module } from '@nestjs/common';
import { AuthnetService } from './authnet.service';

@Module({
  providers: [AuthnetService],
  exports: [AuthnetService],
})
export class AuthnetModule {}
