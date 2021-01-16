import { Logger, Module } from '@nestjs/common';
import { ShipstationhookService } from './shipstationhook.service';
import { ShipstationhookController } from './shipstationhook.controller';
import { HookmutextModule } from '../hookmutext/hookmutext.module';
import { ShipStationProxy } from '../bigcomhook/ShipStationProxy';
import BigCommerceProxy from '../bigcomhook/BigCommerceProxy';

@Module({
  imports: [HookmutextModule],
  controllers: [ShipstationhookController],
  providers: [
    ShipstationhookService,
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
})
export class ShipstationhookModule {}
