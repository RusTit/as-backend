import { Test, TestingModule } from '@nestjs/testing';
import { AuthnetService } from './authnet.service';

describe('AuthnetService', () => {
  let service: AuthnetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthnetService],
    }).compile();

    service = module.get<AuthnetService>(AuthnetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
