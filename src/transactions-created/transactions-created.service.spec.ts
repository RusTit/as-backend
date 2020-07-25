import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedService } from './transactions-created.service';

describe('TransactionsCreatedService', () => {
  let service: TransactionsCreatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionsCreatedService],
    }).compile();

    service = module.get<TransactionsCreatedService>(
      TransactionsCreatedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
