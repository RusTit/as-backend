import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsProcessedService } from './transactions-processed.service';

describe('TransactionsProcessedService', () => {
  let service: TransactionsProcessedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionsProcessedService],
    }).compile();

    service = module.get<TransactionsProcessedService>(
      TransactionsProcessedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
