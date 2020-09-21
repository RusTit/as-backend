import { Body, Controller, Post } from '@nestjs/common';
import { GroupingService } from './grouping.service';
import { OperationResultDto } from '../dtos';
import { GroupNewDto } from './dtos';

@Controller('grouping')
export class GroupingController {
  constructor(private readonly groupingService: GroupingService) {}

  @Post()
  async createNewGroup(
    @Body() groupNewDto: GroupNewDto,
  ): Promise<OperationResultDto> {
    await this.groupingService.createNewGroup(groupNewDto);
    return {
      message: 'Group created',
    };
  }
}
