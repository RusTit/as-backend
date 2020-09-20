import { Test, TestingModule } from '@nestjs/testing';
import { SytemHealthController } from './sytem-health.controller';

describe('SytemHealthController', () => {
  let controller: SytemHealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SytemHealthController],
    }).compile();

    controller = module.get<SytemHealthController>(SytemHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
