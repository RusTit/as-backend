import { Logger, Module } from '@nestjs/common';
import { BigcomhookService } from './bigcomhook.service';
import { BigcomhookController } from './bigcomhook.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { ShipStationProxy } from './ShipStationProxy';
import BigCommerceProxy from './BigCommerceProxy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionProcessedEntity,
      TransactionIssuesEntity,
    ]),
  ],
  providers: [
    BigcomhookService,
    {
      provide: 'ShipStationProxy',
      useFactory: async () => {
        const { SHIPSTATION_API_KEY, SHIPSTATION_API_SECRET } = process.env;
        const shipStationProxy = new ShipStationProxy(
          SHIPSTATION_API_KEY,
          SHIPSTATION_API_SECRET,
        );
        Logger.debug(`Init ShipStation`);
        await shipStationProxy.init();
        return shipStationProxy;
      },
    },
    {
      provide: 'BigCommerceProxy',
      useFactory: () => {
        const {
          BIGCOMMERCE_STORE_HASH,
          BIGCOMMERCE_ACCESS_TOKEN,
          BIGCOMMERCE_CLIENT_ID,
        } = process.env;
        Logger.debug(`BigcomhookService`);
        return new BigCommerceProxy(
          BIGCOMMERCE_STORE_HASH,
          BIGCOMMERCE_CLIENT_ID,
          BIGCOMMERCE_ACCESS_TOKEN,
        );
      },
    },
  ],
  controllers: [BigcomhookController],
  exports: ['ShipStationProxy'],
})
export class BigcomhookModule {}
