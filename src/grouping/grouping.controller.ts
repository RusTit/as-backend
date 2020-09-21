import { Controller } from '@nestjs/common';
import { GroupingService } from './grouping.service';

@Controller('grouping')
export class GroupingController {
  constructor(private readonly groupingService: GroupingService) {}
}
