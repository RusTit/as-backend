import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { AuthnetService } from '../authnet/authnet.service';
import { ShipStationProxy } from '../bigcomhook/ShipStationProxy';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';
import BigCommerceProxy from '../bigcomhook/BigCommerceProxy';

@Injectable()
export class AuthwebhookService {
  constructor(
    private transactionsCreatedService: TransactionsCreatedService,
    private authnetService: AuthnetService,
    @Inject('ShipStationProxy') private shipStationProxy: ShipStationProxy,
    @Inject('BigCommerceProxy') private bigCommerceProxy: BigCommerceProxy,
    private readonly transactionsIssuesService: TransactionsIssuesService,
  ) {}

  async shouldSkip(payload: WebhookDto): Promise<boolean> {
    try {
      const details = await this.authnetService.getTransactionsDetails(
        payload.payload.id,
      );
      switch (details?.solution?.name) {
        case 'Bigcommerce':
          Logger.debug('Skipping BC transaction on AuthNet hook');
          return true;
      }
    } catch (e) {
      Logger.error(`Error on skipping check: ${e.message}`);
    }
    return false;
  }

  async processWebhookPayload(payload: WebhookDto): Promise<void> {
    Logger.debug(payload);
    if (await this.shouldSkip(payload)) {
      Logger.debug(`Transaction should be skipped. ${payload.payload?.id}`);
      return;
    }
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
      await this.shipStationProxy.init();
      const transactionId = payload.payload.id;
      const orderNumber = payload.payload.invoiceNumber;
      const transactionDetails = await this.authnetService.getTransactionsDetails(
        transactionId,
      );
      const { refTransId } = transactionDetails;
      if (refTransId) {
        const mainTransactionDetails = await this.authnetService.getTransactionsDetails(
          refTransId,
        );
        const { settleAmount: originSettleAmount } = transactionDetails;
        const { settleAmount: mainSettleAmount } = mainTransactionDetails;
        if (
          Number.isFinite(originSettleAmount) &&
          Number.isFinite(mainSettleAmount) &&
          originSettleAmount !== mainSettleAmount
        ) {
          Logger.debug(
            `Transaction ${transactionId} is partial refunded (main ${refTransId}, ${originSettleAmount}, ${mainSettleAmount})`,
          );
          const amountPaid = mainSettleAmount;
          const refundedAmount = originSettleAmount - mainSettleAmount;
          const orders = await this.shipStationProxy.getListOrders({
            orderNumber: `${orderNumber}`,
            pageSize: `500`, // to avoid paging issues
          });
          await Promise.all(
            orders.map(async (order) => {
              order.amountPaid = amountPaid;
              order.customerNotes = `Refunded ($${refundedAmount})`;
              return this.shipStationProxy.createOrUpdateOrder(order);
            }),
          );
          return;
        }
      }

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
