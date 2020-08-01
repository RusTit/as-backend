import { Test, TestingModule } from '@nestjs/testing';
import { UiController } from './ui.controller';
import { AuthnetModule } from '../authnet/authnet.module';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';
import { mockRepository } from '../transactions-created/TransactionCreated.mock';
import { UiService } from './ui.service';

describe('Ui Controller', () => {
  let controller: UiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthnetModule],
      controllers: [UiController],
      providers: [
        TransactionsCreatedService,
        {
          provide: getRepositoryToken(TransactionCreatedEntity),
          useValue: mockRepository,
        },
        UiService,
      ],
    }).compile();

    controller = module.get<UiController>(UiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
