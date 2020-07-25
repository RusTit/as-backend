import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedService } from './transactions-created.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';

const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionCreatedEntity[]> {
    return [];
  },
};

describe('TransactionsCreatedService', () => {
  let service: TransactionsCreatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsCreatedService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsCreatedService>(
      TransactionsCreatedService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should executed without errors', async () => {
    expect(await service.createNew('sdf')).toBeUndefined();
  });

  it('should return empty array', async () => {
    expect((await service.findAll()).length).toBe(0);
  });
});
