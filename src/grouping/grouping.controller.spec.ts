import { Test, TestingModule } from '@nestjs/testing';
import { GroupingController } from './grouping.controller';

describe('GroupingController', () => {
  let controller: GroupingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupingController],
    }).compile();

    controller = module.get<GroupingController>(GroupingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
