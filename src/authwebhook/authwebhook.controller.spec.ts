import { Test, TestingModule } from '@nestjs/testing';
import { AuthwebhookController } from './authwebhook.controller';
import { AuthwebhookService } from './authwebhook.service';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthnetModule } from '../authnet/authnet.module';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionCreatedEntity[]> {
    return [];
  },
};

describe('Authwebhook Controller', () => {
  let controller: AuthwebhookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      controllers: [AuthwebhookController],
      providers: [
        AuthwebhookService,
        TransactionsCreatedService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<AuthwebhookController>(AuthwebhookController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
