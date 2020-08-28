import { Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { AuthnetService } from '../authnet/authnet.service';
import { ShipStationProxy } from '../bigcomhook/ShipStationProxy';

@Injectable()
export class AuthwebhookService {
  constructor(
    private transactionsCreatedService: TransactionsCreatedService,
    private authnetService: AuthnetService,
  ) {}

  async processWebhookPayload(payload: WebhookDto): Promise<void> {
    Logger.debug(payload);
    switch (payload.eventType) {
      case 'net.authorize.payment.authcapture.created':
      case 'net.authorize.payment.capture.created':
        await this.transactionsCreatedService.createNew(payload.payload.id);
        break;
      case 'net.authorize.payment.refund.created':
      case 'net.authorize.payment.void.created':
        await this.processRefundVoidedTransactions(payload);
        break;
    }
  }

  async processRefundVoidedTransactions(payload: WebhookDto): Promise<void> {
    Logger.debug(`Processing refund/voided transactions`);
    const transactionDetails = await this.authnetService.getTransactionsDetails(
      payload.payload.id,
    );
    const orderNumber = transactionDetails.order.invoiceNumber;
    const { SHIPSTATION_API_KEY, SHIPSTATION_API_SECRET } = process.env;
    const shipStationProxy = new ShipStationProxy(
      SHIPSTATION_API_KEY,
      SHIPSTATION_API_SECRET,
    );
    Logger.debug(`Init ShipStation`);
    await shipStationProxy.init();
    const orders = await shipStationProxy.getListOrders({
      orderNumber: `${orderNumber}`,
      pageSize: `500`, // to avoid paging issues
    });
    await Promise.all(
      orders.map(async (order) => {
        const { orderId } = order;
        await shipStationProxy.deleteOrder(orderId);
      }),
    );
  }
}
