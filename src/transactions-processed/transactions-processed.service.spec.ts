import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsProcessedService } from './transactions-processed.service';
import { TransactionProcessedEntity } from './TransactionProcessed.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from './TransactionProcessed.mock';

describe('TransactionsProcessedService', () => {
  let service: TransactionsProcessedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      providers: [
        TransactionsProcessedService,
        {
          provide: getRepositoryToken(TransactionProcessedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsProcessedService>(
      TransactionsProcessedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array', async () => {
    expect((await service.findAll()).length).toBe(0);
  });
});
