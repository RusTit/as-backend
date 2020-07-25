import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedService } from './transactions-created.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';

describe('TransactionsCreatedService', () => {
  let service: TransactionsCreatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([TransactionCreatedEntity])],
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
