import { Test, TestingModule } from '@nestjs/testing';
import { AuthwebhookController } from './authwebhook.controller';
import { AuthwebhookService } from './authwebhook.service';

describe('Authwebhook Controller', () => {
  let controller: AuthwebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthwebhookController],
      providers: [AuthwebhookService],
    }).compile();

    controller = module.get<AuthwebhookController>(AuthwebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
