import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedService } from './transactions-created.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { mockRepository } from './TransactionCreated.mock';

describe('TransactionsCreatedService', () => {
  let service: TransactionsCreatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      providers: [
        TransactionsCreatedService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsCreatedService>(
      TransactionsCreatedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array', async () => {
    expect((await service.findAll()).length).toBe(0);
  });
});
