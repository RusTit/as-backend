import { Test, TestingModule } from '@nestjs/testing';
import { UiService } from './ui.service';
import { mockRepository as mockRCreated } from '../transactions-created/TransactionCreated.mock';
import { mockRepository as mockRIssues } from '../transactions-issues/TransactionIssues.mock';
import { mockRepository as mockRProcessed } from '../transactions-processed/TransactionProcessed.mock';
import { mockRepository as mockProduct } from '../products/Product.mock';
import { AuthnetModule } from '../authnet/authnet.module';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';
import { TransactionsProcessedService } from '../transactions-processed/transactions-processed.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { ProductsService } from '../products/products.service';
import { ProductEntity } from '../products/Product.entity';

describe('UiService', () => {
  let service: UiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      providers: [
        TransactionsCreatedService,
        TransactionsIssuesService,
        TransactionsProcessedService,
        ProductsService,
        UiService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRCreated,
        },
        {
          provide: getRepositoryToken(TransactionIssuesEntity),
          useValue: mockRIssues,
        },
        {
          provide: getRepositoryToken(TransactionProcessedEntity),
          useValue: mockRProcessed,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProduct,
        },
      ],
    }).compile();

    service = module.get<UiService>(UiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
