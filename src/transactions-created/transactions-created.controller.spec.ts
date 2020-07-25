import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedController } from './transactions-created.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { TransactionsCreatedService } from './transactions-created.service';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionCreatedEntity[]> {
    return [];
  },
};

describe('TransactionsCreated Controller', () => {
  let controller: TransactionsCreatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsCreatedController],
      providers: [
        TransactionsCreatedService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<TransactionsCreatedController>(
      TransactionsCreatedController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
