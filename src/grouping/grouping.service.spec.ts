import { Test, TestingModule } from '@nestjs/testing';
import { GroupingService } from './grouping.service';

describe('GroupingService', () => {
  let service: GroupingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupingService],
    }).compile();

    service = module.get<GroupingService>(GroupingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
