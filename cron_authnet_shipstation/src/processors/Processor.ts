import { Logger } from 'log4js';
import LoggerFactory from '../logger';
import { TODO_ANY } from '../Helper';
import { Order, OrderItem } from '../ShipStationTypes';

export const PAYMENT_METHOD = new Map();
PAYMENT_METHOD.set('creditCard', 'Credit card');
PAYMENT_METHOD.set('bankAccount', 'Bank account');

export type OrderTransactionPair = {
  order: Order;
  transaction: TODO_ANY;
};

export type ProcessorResult = {
  orderTrans: OrderTransactionPair[];
  skipped: TODO_ANY[];
};

export default abstract class Processor {
  protected readonly logger: Logger;
  protected constructor(name: string) {
    this.logger = LoggerFactory(name);
  }
  abstract process(transactionDetails: TODO_ANY[]): Promise<ProcessorResult>;

  protected getPaymentMethod(transactionDetails: TODO_ANY): string {
    const keys = Object.keys(transactionDetails.payment);
    if (keys.length === 0) {
      return 'Unknown method. No description';
    }
    if (keys.length > 1) {
      this.logger.warn(`Something wrong with payment object`);
      this.logger.warn(transactionDetails.payment);
    }
    const [key] = keys;
    if (PAYMENT_METHOD.has(key)) {
      return PAYMENT_METHOD.get(key);
    }
    return transactionDetails.payment[key];
  }

  protected getAmountPaidForItems(items: OrderItem[]): number {
    let amountPaid = 0;
    items.forEach(item => {
      const unitPrice =
        typeof item.unitPrice === 'undefined' ? 0 : item.unitPrice;
      const shippingAmount =
        typeof item.shippingAmount === 'undefined' ? 0 : item.shippingAmount;
      amountPaid = amountPaid + unitPrice + shippingAmount;
    });
    return amountPaid;
  }
}
