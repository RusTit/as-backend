import { Test, TestingModule } from '@nestjs/testing';
import { AuthwebhookService } from './authwebhook.service';

describe('AuthwebhookService', () => {
  let service: AuthwebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthwebhookService],
    }).compile();

    service = module.get<AuthwebhookService>(AuthwebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
