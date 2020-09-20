import { Module } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';

@Module({
  providers: [SystemHealthService],
})
export class SystemHealthModule {}
