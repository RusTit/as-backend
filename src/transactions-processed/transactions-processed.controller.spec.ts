import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsProcessedController } from './transactions-processed.controller';

describe('TransactionsProcessed Controller', () => {
  let controller: TransactionsProcessedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsProcessedController],
    }).compile();

    controller = module.get<TransactionsProcessedController>(
      TransactionsProcessedController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
