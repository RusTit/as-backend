import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedController } from './transactions-created.controller';

describe('TransactionsCreated Controller', () => {
  let controller: TransactionsCreatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsCreatedController],
    }).compile();

    controller = module.get<TransactionsCreatedController>(
      TransactionsCreatedController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
