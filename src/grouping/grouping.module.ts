import { Module } from '@nestjs/common';
import { GroupingController } from './grouping.controller';
import { GroupingService } from './grouping.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupEntity } from './Group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  controllers: [GroupingController],
  providers: [GroupingService],
  exports: [GroupingService],
})
export class GroupingModule {}
