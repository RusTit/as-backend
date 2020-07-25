import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedService } from './transactions-created.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { ConfigModule } from '@nestjs/config';

describe('TransactionsCreatedService', () => {
  let service: TransactionsCreatedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([TransactionCreatedEntity]),
      ],
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
