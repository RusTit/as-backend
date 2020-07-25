import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsCreatedController } from './transactions-created.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from './TransactionCreated.entity';
import { TransactionsCreatedService } from './transactions-created.service';
import { ConfigModule } from '@nestjs/config';

describe('TransactionsCreated Controller', () => {
  let controller: TransactionsCreatedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot(),

        TypeOrmModule.forFeature([TransactionCreatedEntity]),
      ],
      controllers: [TransactionsCreatedController],
      providers: [TransactionsCreatedService],
    }).compile();

    controller = module.get<TransactionsCreatedController>(
      TransactionsCreatedController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
