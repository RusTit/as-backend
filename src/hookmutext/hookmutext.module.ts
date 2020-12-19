import { Module } from '@nestjs/common';
import { HookmutextService } from './hookmutext.service';

@Module({
  providers: [HookmutextService],
  exports: [HookmutextService],
})
export class HookmutextModule {}
