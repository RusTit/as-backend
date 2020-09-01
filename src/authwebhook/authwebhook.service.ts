import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { AuthnetService } from '../authnet/authnet.service';
import { ShipStationProxy } from '../bigcomhook/ShipStationProxy';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';

@Injectable()
export class AuthwebhookService {
  constructor(
    private transactionsCreatedService: TransactionsCreatedService,
    private authnetService: AuthnetService,
    @Inject('ShipStationProxy') private shipStationProxy: ShipStationProxy,
    private readonly transactionsIssuesService: TransactionsIssuesService,
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
    Logger.debug(
      `Processing refund/voided transactions: ${payload.payload.id}`,
    );
    try {
      const orderNumber = payload.payload.invoiceNumber;
      await this.shipStationProxy.init();
      const orders = await this.shipStationProxy.getListOrders({
        orderNumber: `${orderNumber}`,
        pageSize: `500`, // to avoid paging issues
      });
      Logger.debug(`Found ${orders.length} orders for ${orderNumber}`);
      await Promise.all(
        orders.map(async (order) => {
          const { orderId } = order;
          Logger.debug(`Deleting ${orderId} (${orderNumber})`);
          await this.shipStationProxy.deleteOrder(orderId);
        }),
      );
    } catch (e) {
      const issue = e as Error;
      Logger.error(`${issue.message}, ${issue.stack}`);
      await this.transactionsIssuesService.createNewIssuesEntity(
        payload.payload.id,
        e,
      );
    }
  }
}
