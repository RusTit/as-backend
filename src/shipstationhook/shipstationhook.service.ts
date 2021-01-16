import { Inject, Injectable, Logger } from '@nestjs/common';
import BigCommerceProxy from '../bigcomhook/BigCommerceProxy';
import { ShipStationProxy } from '../bigcomhook/ShipStationProxy';
import { WebHookPayload } from './dtos';
import { OrderStatus } from '../bigcomhook/bigcomhook.service';

@Injectable()
export class ShipstationhookService {
  constructor(
    @Inject('ShipStationProxy') private shipStationProxy: ShipStationProxy,
    @Inject('BigCommerceProxy') private bigCommerceProxy: BigCommerceProxy,
  ) {}

  async handleOrderIsShipped(payload: WebHookPayload): Promise<void> {
    await this.shipStationProxy.init();
    const orders = await this.shipStationProxy.getListOrdersRaw(
      payload.resource_url,
    );
    await Promise.all(
      orders.map(async (order) => {
        const { orderNumber } = order;
        const orderBigCommerce = await this.bigCommerceProxy.getOrder(
          orderNumber,
        );
        if (orderBigCommerce.status_id !== OrderStatus.AwaitingShipment) {
          Logger.debug(`Not suitable status: ${orderBigCommerce.status_id}`);
          return;
        }
      }),
    );
  }

  async handleWebHook(payload: WebHookPayload): Promise<void> {
    Logger.debug(`Shipstation webhook payload: ${JSON.stringify(payload)}`);
    switch (payload.resource_type) {
      case 'SHIP_NOTIFY':
        return this.handleOrderIsShipped(payload);
    }
  }
}
