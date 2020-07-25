import { Test, TestingModule } from '@nestjs/testing';
import { AuthwebhookService } from './authwebhook.service';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionCreatedEntity[]> {
    return [];
  },
};

describe('AuthwebhookService', () => {
  let service: AuthwebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsCreatedService,
        AuthwebhookService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuthwebhookService>(AuthwebhookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
