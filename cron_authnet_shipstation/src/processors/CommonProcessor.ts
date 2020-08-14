import Processor, { OrderTransactionPair, ProcessorResult } from './Processor';
import { TODO_ANY } from '../Helper';
import CombineRule from '../combineRules/CombineRule';
import CompactRule from '../combineRules/CompactRule';
import HardwoodRule from '../combineRules/HardwoodRule';
import * as Helper from '../Helper';
import { isApprovedTransaction } from '../filters';
import { Address, Order, OrderItem, Product } from '../ShipStationTypes';
import { ProductTag, UnknownProduct } from '../ShipStationProxy';
import path from 'path';
import fs from 'fs/promises';
import CsvParse from 'csv-parse';
import { moveIssuedTransaction } from '../db';

const combineRules: Array<CombineRule> = [
  new CompactRule(),
  new HardwoodRule(),
];
export function combineTransactions<T>(
  transactions: Array<T>
): Array<T | Array<T>> {
  let position = 0;
  while (position < transactions.length) {
    const transaction = transactions[position];
    for (const rule of combineRules) {
      if (rule.isAcceptable(transaction)) {
        const transactionsAfterProcess = rule.process(transactions, position);
        const isProcessed =
          transactions.length !== transactionsAfterProcess.length;
        transactions = transactionsAfterProcess;
        if (isProcessed) {
          break;
        }
      }
    }
    position++;
  }

  return transactions;
}

export default class CommonProcessor extends Processor {
  constructor(tagsList: Map<string, ProductTag>) {
    super('CommonProcessor');
    this.products = new Map<string, Product>();
    this.tagsList = tagsList;
  }

  async init(): Promise<void> {
    if (this.isInit) {
      return;
    }
    this.logger.info('Initialization');
    this.isInit = true;
    const PRODUCTS_CSV_PATH = path.resolve(
      __dirname,
      '..',
      '..',
      'csv',
      'products.csv'
    );
    const productsData = await fs.readFile(PRODUCTS_CSV_PATH, {
      encoding: 'utf8',
    });
    const products: Array<Product> = await new Promise((resolve, reject) => {
      CsvParse(
        productsData,
        {
          cast: true,
          columns: true,
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    for (const product of products) {
      this.products.set(product.name, product);
    }
  }

  private isInit = false;
  private readonly products: Map<string, Product>;
  private readonly tagsList: Map<string, ProductTag>;

  static createAddress(data: TODO_ANY): Address {
    return {
      city: `${data.city}`,
      company: '',
      country: 'US',
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phoneNumber,
      postalCode: `${data.zip}`,
      residential: '',
      state: `${data.state}`,
      street1: `${data.address}`,
      street2: '',
      street3: '',
      addressVerified: 'Address not yet validated',
    };
  }

  static getColorFromTheDescription(description?: string): string | undefined {
    if (!description) {
      return;
    }
    const position = description.lastIndexOf(':');
    if (position === -1) {
      return;
    }
    return description.slice(position + 1).trim();
  }

  matchProductForTransaction(transaction: TODO_ANY): Product | undefined {
    const keys = this.products.keys();
    let productKey;
    let points = 0;
    const { description } = transaction.order;
    if (!description) {
      return;
    }
    for (const key of keys) {
      if (points < key.length && description.includes(key)) {
        productKey = key;
        points = productKey.length;
      }
    }
    if (productKey) {
      return this.products.get(productKey);
    }
  }

  getOrderItems(arrTransactions: Array<TODO_ANY>): OrderItem[] {
    const result: OrderItem[] = [];
    for (const transaction of arrTransactions) {
      const product = this.matchProductForTransaction(transaction);
      if (!product) {
        const { description } = transaction.order;
        const message = `App cannot process transactions with description: ${description}`;
        this.logger.warn(message);
        this.logger.warn(JSON.stringify(transaction));
        throw new UnknownProduct(message);
      }
      const color = CommonProcessor.getColorFromTheDescription(
        transaction.order.description
      );
      const item: OrderItem = {
        name: product.name,
        sku: product.sku,
        unitPrice: transaction.settleAmount,
        quantity: 1,
      };
      item.options = [];
      if (color) {
        item.options.push({
          name: 'color',
          value: color,
        });
      }
      result.push(item);
    }
    return result;
  }

  static getCustomerUsername(transactionDetails: TODO_ANY): string {
    return `${transactionDetails.billTo.firstName} ${transactionDetails.billTo.lastName}`;
  }

  getTagsIdArr(transactionDetails: TODO_ANY): number[] {
    const color = CommonProcessor.getColorFromTheDescription(
      transactionDetails.order.description
    );
    if (typeof color === 'string') {
      const tag = this.tagsList.get(color);
      if (tag) {
        return [tag.tagId];
      } else {
        this.logger.warn(`Cannot find tagId for color: ${color}`);
      }
    }
    return [];
  }

  transformData(transactionDetails: TODO_ANY | Array<TODO_ANY>): Order {
    const arr = Array.isArray(transactionDetails)
      ? transactionDetails
      : [transactionDetails];
    if (arr.length > 1) {
      transactionDetails = arr[0];
    }
    const billTo: Address = CommonProcessor.createAddress(
      transactionDetails.billTo
    );
    let shipTo: Address;
    if (
      typeof transactionDetails.shipTo === 'undefined' ||
      transactionDetails.shipTo.state === '0'
    ) {
      shipTo = billTo;
    } else {
      shipTo = CommonProcessor.createAddress(transactionDetails.shipTo);
    }
    const items = this.getOrderItems(arr);
    if (items.length === 0) {
      throw new Error(`Cannot create items for transaction`);
    }
    const amountPaid = this.getAmountPaidForItems(items);
    const firstProduct = this.products.get(items[0].name as string) as Product;
    const result: Order = {
      billTo,
      customerUsername: CommonProcessor.getCustomerUsername(transactionDetails),
      customerEmail: transactionDetails.customer?.email,
      orderDate: `${transactionDetails.submitTimeUTC}`,
      paymentDate: transactionDetails.batch?.settlementTimeUTC,
      orderNumber: transactionDetails.order.invoiceNumber,
      // amountPaid: transactionDetails.settleAmount,
      orderStatus: 'awaiting_shipment',
      paymentMethod: this.getPaymentMethod(transactionDetails),
      shipTo,
      tagIds: this.getTagsIdArr(transactionDetails),
      items,
      dimensions: {
        height: firstProduct.height,
        width: firstProduct.width,
        length: firstProduct.length,
        units: firstProduct.dimUnits,
      },
      weight: {
        units: firstProduct.weightUnits,
        value: firstProduct.weight,
        WeightUnits: firstProduct.weight,
      },
      amountPaid,
    };
    this.logger.debug(`Result: ${result.customerUsername}`);
    return result;
  }

  async process(transactionDetails: TODO_ANY[]): Promise<ProcessorResult> {
    await this.init();
    const sortedTransactions = transactionDetails.sort(
      (a, b) => a.transId - b.transId
    );
    this.logger.info(`Total transactions count: ${sortedTransactions.length}`);
    const combinedTransactions = combineTransactions<Helper.TODO_ANY>(
      sortedTransactions
    );
    this.logger.info(
      `Combined transactions count: ${combinedTransactions.length}`
    );
    const approvedTransactions = combinedTransactions.filter(
      isApprovedTransaction
    );
    this.logger.info(
      `Approved transactions count: ${approvedTransactions.length}`
    );
    const transformed = [];
    const orderTrans: OrderTransactionPair[] = [];
    const issuedTrans = new Set<TODO_ANY>();
    for (const transaction of approvedTransactions) {
      try {
        const order = this.transformData(transaction);
        orderTrans.push({
          order,
          transaction,
        });
        transformed.push(transaction);
      } catch (e) {
        this.logger.warn(`Error while transforming item`);
        this.logger.warn(e);
        await moveIssuedTransaction(transaction, e);
        issuedTrans.add(transaction);
      }
    }
    const transformedFlat = transformed.flat();
    const result: ProcessorResult = {
      orderTrans,
      skipped: transactionDetails.filter(
        tr => !transformedFlat.includes(tr) && !issuedTrans.has(tr)
      ),
    };
    return Promise.resolve(result);
  }
}
