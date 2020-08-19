import { Test, TestingModule } from '@nestjs/testing';
import { BigcomhookController } from './bigcomhook.controller';

describe('Bigcomhook Controller', () => {
  let controller: BigcomhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BigcomhookController],
    }).compile();

    controller = module.get<BigcomhookController>(BigcomhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
