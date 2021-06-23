import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebhookDto } from './dtos';
import { TransactionsCreatedService } from '../transactions-created/transactions-created.service';
import { AuthnetService } from '../authnet/authnet.service';
import { ShipStationProxy } from '../bigcomhook/ShipStationProxy';
import { TransactionsIssuesService } from '../transactions-issues/transactions-issues.service';
import BigCommerceProxy from '../bigcomhook/BigCommerceProxy';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthwebhookService {
  constructor(
    private transactionsCreatedService: TransactionsCreatedService,
    private authnetService: AuthnetService,
    @Inject('ShipStationProxy') private shipStationProxy: ShipStationProxy,
    @Inject('BigCommerceProxy') private bigCommerceProxy: BigCommerceProxy,
    private readonly transactionsIssuesService: TransactionsIssuesService,
    @InjectRepository(TransactionProcessedEntity)
    private transactionProcessedEntity: Repository<TransactionProcessedEntity>,
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
      let orderNumber = null;
      const transactionDetails = await this.authnetService.getTransactionsDetails(
        transactionId,
      );

      const mainTransactionId = transactionDetails.refTransId;

      const rowOrderProcessed = await this.transactionProcessedEntity.findOne({
        where: {
          transactionId: mainTransactionId,
        },
      });
      if (rowOrderProcessed) {
        orderNumber = rowOrderProcessed.orderObject.orderNumber;
      } else {
        orderNumber = payload.payload.invoiceNumber;
      }

      const { settleAmount: originSettleAmount } = transactionDetails;

      const orders = await this.shipStationProxy.getListOrders({
        orderNumber: `${orderNumber}`,
        pageSize: `500`, // to avoid paging issues
      });
      Logger.debug(`Found ${orders.length} orders for ${orderNumber}`);
      await Promise.all(
        orders.map(async (order) => {
          const { orderId } = order;
          if (
            Number.isFinite(originSettleAmount) &&
            order.amountPaid !== originSettleAmount &&
            order.amountPaid - originSettleAmount > 0
          ) {
            order.amountPaid -= originSettleAmount;
            order.customerNotes = `Refunded ($${originSettleAmount})`;
            Logger.debug(
              `Partial refunded ${orderId} (${orderNumber}) transactionId: ${transactionId}`,
            );
          } else {
            order.orderStatus = 'cancelled';
            Logger.debug(`Marking cancelled ${orderId} (${orderNumber})`);
            /*
            Logger.debug(`Deleting ${orderId} (${orderNumber})`);
            await this.shipStationProxy.deleteOrder(orderId);
            */
          }
          await this.shipStationProxy.createOrUpdateOrder(order);
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
