import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { GroupingService } from './grouping.service';
import { OperationResultDto } from '../dtos';
import { GroupNewDto, GroupingEditDto } from './dtos';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/authenticated.guard';

@ApiCookieAuth()
@ApiTags('grouping')
@UseGuards(AuthenticatedGuard)
@Controller('grouping')
export class GroupingController {
  constructor(private readonly groupingService: GroupingService) {}

  @Post()
  @Redirect('/ui/grouping')
  async createNewGroup(
    @Body() groupNewDto: GroupNewDto,
  ): Promise<OperationResultDto> {
    await this.groupingService.createNewGroup(groupNewDto);
    return {
      message: 'Group created',
    };
  }

  @Post(':id') // todo: this should be put, but for now let's use post
  @Redirect('/ui/grouping')
  async updateGroup(
    @Param('id') id: number,
    @Body() productEditDto: GroupingEditDto,
  ): Promise<OperationResultDto> {
    const dbGroup = await this.groupingService.updateGroupingData(
      id,
      productEditDto,
    );
    if (!dbGroup) {
      throw new HttpException(
        `Group not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      message: 'Group was updated successfully',
    };
  }

  @Delete(':id')
  async deleteGroup(@Param('id') id: number): Promise<OperationResultDto> {
    if (!(await this.groupingService.deleteGroupById(id))) {
      throw new HttpException(
        `Group not found by db id: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      message: 'Group was successfully delete.',
    };
  }
}
