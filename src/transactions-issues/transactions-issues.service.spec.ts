import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsIssuesService } from './transactions-issues.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionIssuesEntity } from './TransactionIssues.entity';
import { AuthnetModule } from '../authnet/authnet.module';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionIssuesEntity[]> {
    return [];
  },
};

describe('TransactionsIssuesService', () => {
  let service: TransactionsIssuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      providers: [
        TransactionsIssuesService,
        {
          provide: getRepositoryToken(TransactionIssuesEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsIssuesService>(TransactionsIssuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty array', async () => {
    expect((await service.findAll()).length).toBe(0);
  });
});
