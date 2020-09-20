import { Module } from '@nestjs/common';
import { SystemHealthService } from './system-health.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemHealthEntity } from './SystemHealth.entity';
import { SystemHealthController } from './system-health.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemHealthEntity])],
  providers: [SystemHealthService],
  controllers: [SystemHealthController],
})
export class SystemHealthModule {}
