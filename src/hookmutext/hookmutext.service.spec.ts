import { Test, TestingModule } from '@nestjs/testing';
import { HookmutextService } from './hookmutext.service';

describe('HookmutextService', () => {
  let service: HookmutextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HookmutextService],
    }).compile();

    service = module.get<HookmutextService>(HookmutextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
