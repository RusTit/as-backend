import { Test, TestingModule } from '@nestjs/testing';
import { BigcomhookService } from './bigcomhook.service';

describe('BigcomhookService', () => {
  let service: BigcomhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BigcomhookService],
    }).compile();

    service = module.get<BigcomhookService>(BigcomhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
