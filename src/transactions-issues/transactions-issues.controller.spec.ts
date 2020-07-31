import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsIssuesController } from './transactions-issues.controller';
import { TransactionIssuesEntity } from './TransactionIssues.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionsIssuesService } from './transactions-issues.service';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionIssuesEntity[]> {
    return [];
  },
};

describe('TransactionsIssues Controller', () => {
  let controller: TransactionsIssuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      controllers: [TransactionsIssuesController],
      providers: [
        TransactionsIssuesService,
        {
          provide: getRepositoryToken(TransactionIssuesEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<TransactionsIssuesController>(
      TransactionsIssuesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
