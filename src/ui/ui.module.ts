import { Module } from '@nestjs/common';
import { UiService } from './ui.service';
import { UiController } from './ui.controller';
import { TransactionsCreatedModule } from '../transactions-created/transactions-created.module';
import { TransactionsIssuesModule } from '../transactions-issues/transactions-issues.module';
import { TransactionsProcessedModule } from '../transactions-processed/transactions-processed.module';
import { ProductsModule } from '../products/products.module';
import { GroupingModule } from '../grouping/grouping.module';

@Module({
  imports: [
    TransactionsCreatedModule,
    TransactionsIssuesModule,
    TransactionsProcessedModule,
    ProductsModule,
    GroupingModule,
  ],
  providers: [UiService],
  controllers: [UiController],
})
export class UiModule {}
