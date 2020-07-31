import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsIssuesService } from './transactions-issues.service';

describe('TransactionsIssuesService', () => {
  let service: TransactionsIssuesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionsIssuesService],
    }).compile();

    service = module.get<TransactionsIssuesService>(TransactionsIssuesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
