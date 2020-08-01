import { Test, TestingModule } from '@nestjs/testing';
import { UiService } from './ui.service';
import { mockRepository } from '../transactions-created/TransactionCreated.mock';
import { AuthnetModule } from '../authnet/authnet.module';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';

describe('UiService', () => {
  let service: UiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      providers: [
        TransactionsCreatedService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
        UiService,
      ],
    }).compile();

    service = module.get<UiService>(UiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
