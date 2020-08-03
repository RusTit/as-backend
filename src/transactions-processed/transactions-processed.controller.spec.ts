import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsProcessedController } from './transactions-processed.controller';
import { TransactionProcessedEntity } from './TransactionProcessed.entity';
import { AuthnetModule } from '../authnet/authnet.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionsProcessedService } from './transactions-processed.service';
import { mockRepository } from './TransactionProcessed.mock';

describe('TransactionsProcessed Controller', () => {
  let controller: TransactionsProcessedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      controllers: [TransactionsProcessedController],
      providers: [
        TransactionsProcessedService,
        {
          provide: getRepositoryToken(TransactionProcessedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<TransactionsProcessedController>(
      TransactionsProcessedController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
