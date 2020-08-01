import { Injectable } from '@nestjs/common';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { TransactionCreatedEntity } from '../transactions-created/TransactionCreated.entity';

@Injectable()
export class UiService {
  constructor(
    private readonly transactionsCreatedService: TransactionsCreatedService,
  ) {}

  async getArrayOfTransactionsCreated(): Promise<TransactionCreatedEntity[]> {
    return this.transactionsCreatedService.findAll();
  }
}
