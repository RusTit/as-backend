import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsIssuesController } from './transactions-issues.controller';

describe('TransactionsIssues Controller', () => {
  let controller: TransactionsIssuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsIssuesController],
    }).compile();

    controller = module.get<TransactionsIssuesController>(
      TransactionsIssuesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
