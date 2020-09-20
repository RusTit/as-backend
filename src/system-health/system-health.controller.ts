import { Controller, Get, Query } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';
import { ListSystemHealthQuery, SystemHealthDto } from './dtos';

@Controller('system-health')
export class SystemHealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  @Get()
  async findAll(
    @Query() options?: ListSystemHealthQuery,
  ): Promise<Array<SystemHealthDto>> {
    return this.systemHealthService.findAll(options.skip, options.take);
  }
}
