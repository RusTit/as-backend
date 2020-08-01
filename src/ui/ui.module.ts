import { Module } from '@nestjs/common';
import { UiService } from './ui.service';
import { UiController } from './ui.controller';
import { TransactionsCreatedModule } from '../transactions-created/transactions-created.module';

@Module({
  imports: [TransactionsCreatedModule],
  providers: [UiService],
  controllers: [UiController],
})
export class UiModule {}
