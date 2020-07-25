import { Controller } from '@nestjs/common';
import { TransactionsCreatedService } from './transactions-created.service';

@Controller('transactions-created')
export class TransactionsCreatedController {
  constructor(private transactionsCreatedService: TransactionsCreatedService) {}
}
