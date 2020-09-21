import { Module } from '@nestjs/common';
import { GroupingController } from './grouping.controller';
import { GroupingService } from './grouping.service';

@Module({
  controllers: [GroupingController],
  providers: [GroupingService],
})
export class GroupingModule {}
