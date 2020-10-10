import Processor, { OrderTransactionPair, ProcessorResult } from './Processor';
import * as Helper from '../Helper';
import { TODO_ANY } from '../Helper';
import CombineRule from '../combineRules/CombineRule';
import CompactRule from '../combineRules/CompactRule';
import HardwoodRule from '../combineRules/HardwoodRule';
import { isApprovedTransaction } from '../filters';
import {
  Address,
  AdvancedOptions,
  Order,
  OrderItem,
  Product,
} from '../ShipStationTypes';
import { ProductTag, UnknownProduct } from '../ShipStationProxy';
import path from 'path';
import fs from 'fs/promises';
import CsvParse from 'csv-parse';
import { getProductsFromTheDb, moveIssuedTransaction } from '../db';
import { PreProcessor } from '../preprocessors/PreProcessor';
import { StandartRFIDLock } from '../preprocessors/combined/StandartRFIDLock';
import { BluetoothLock } from '../preprocessors/combined/BluetoothLock';
import { BiometricFingerprintLock } from '../preprocessors/combined/BiometricFingerprintLock';
import { BluetoothSoloLock } from '../preprocessors/solo/BluetoothSoloLock';
import { BiometricFingerprintSoloLock } from '../preprocessors/solo/BiometricFingerprintSoloLock';
import { StandartRFIDLockV2 } from '../preprocessors/combined/StandartRFIDLockV2';
import {
  extractMetaFromDescription,
  GeneralCombinedPreProcessor,
} from '../preprocessors/combined/GeneralCombinedPreProcessor';

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

export const colorSpecialCases = new Map<string, string>();
colorSpecialCases.set('Country-Pine', 'Country Pine');
colorSpecialCases.set('Dark Walnut', 'Walnut');
export function convertColorName(name: string): string {
  if (colorSpecialCases.has(name)) {
    return colorSpecialCases.get(name) as string;
  }
  return name;
}

export default class CommonProcessor extends Processor {
  private readonly preProcessors: PreProcessor[];

  constructor(tagsList: Map<string, ProductTag>) {
    super('CommonProcessor');
    this.products = new Map<string, Product>();
    this.tagsList = tagsList;
    this.preProcessors = [
      new StandartRFIDLock(),
      new StandartRFIDLockV2(),
      new BluetoothLock(),
      new BiometricFingerprintLock(),
      new BluetoothSoloLock(),
      new BiometricFingerprintSoloLock(),
      new GeneralCombinedPreProcessor(),
    ];
  }

  async getProductsFromTheCSV(): Promise<Product[]> {
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
    return new Promise((resolve, reject) => {
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
  }

  async init(): Promise<void> {
    if (this.isInit) {
      return;
    }
    this.logger.info('Initialization');
    this.isInit = true;
    const products = await getProductsFromTheDb();
    for (const product of products) {
      this.products.set(product.name, product);
    }
  }

  private isInit = false;
  private readonly products: Map<string, Product>;
  private readonly tagsList: Map<string, ProductTag>;

  static createAddress(data: TODO_ANY, borrowAddress?: Address): Address {
    const name: string = data.firstName
      ? `${data.firstName} ${data.lastName}`
      : `${borrowAddress?.name}`;
    const state =
      !data.state || data.state === '0' ? borrowAddress?.state : data.state;
    return {
      city: `${data.city ?? borrowAddress?.city}`,
      company: '',
      country: 'US',
      name,
      phone: data.phoneNumber ?? borrowAddress?.phone,
      postalCode: `${data.zip ?? borrowAddress?.postalCode}`,
      residential: '',
      state,
      street1: `${data.address ?? borrowAddress?.street1}`,
      street2: '',
      street3: '',
      addressVerified: 'Address not yet validated',
    };
  }

  static getColorFromTheDescription(description?: string): string | undefined {
    if (!description) {
      return;
    }
    const [, meta] = extractMetaFromDescription(description);
    return meta.get('color');
  }

  matchProductForDescription(description?: string): Product | undefined {
    if (!description) {
      return;
    }
    const keys = this.products.keys();
    let productKey;
    let points = 0;
    for (const key of keys) {
      if (points < key.length && description.includes(key)) {
        const product = this.products.get(key);
        if (typeof product?.height === 'number') {
          productKey = key;
          points = productKey.length;
        }
      }
    }
    if (productKey) {
      const product = { ...this.products.get(productKey) } as Product;
      const [name, meta] = extractMetaFromDescription(description);
      const metaStr = Array.from(meta.entries())
        .filter(([K]) => K !== 'color')
        .map(([K, V]) => `${K}:${V}`)
        .join(' ');
      product.name = `${name} ${metaStr}`;
      return product;
    }
  }

  getOrderItems(arrTransactions: Array<TODO_ANY>): OrderItem[] {
    const result: OrderItem[] = [];
    for (const transaction of arrTransactions) {
      const { description } = transaction.order;
      const product = this.matchProductForDescription(description);
      if (!product) {
        const message = `App cannot process transactions with description: ${description}`;
        this.logger.warn(message);
        this.logger.warn(JSON.stringify(transaction));
        throw new UnknownProduct(message);
      }
      const color = CommonProcessor.getColorFromTheDescription(description);
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

  getSubMatchTag(color: string): ProductTag | undefined {
    const keys = this.tagsList.keys();
    let keyMatch: string | undefined = undefined;
    for (const key of keys) {
      if (color.includes(key)) {
        keyMatch = key;
      }
    }
    if (keyMatch) {
      return this.tagsList.get(keyMatch);
    }
  }

  getTagsIdArr(transactionDetails: TODO_ANY): number[] {
    let color = CommonProcessor.getColorFromTheDescription(
      transactionDetails.order.description
    );
    if (typeof color === 'string') {
      color = convertColorName(color);
      let tag = this.tagsList.get(color);
      if (!tag) {
        tag = this.getSubMatchTag(color);
      }
      if (tag) {
        return [tag.tagId];
      } else {
        this.logger.warn(`Cannot find tagId for color: ${color}`);
      }
    }
    return [];
  }

  getProductWithUnits(items: OrderItem[]): Product {
    for (const item of items) {
      const tempProduct = this.matchProductForDescription(item.name);
      if (typeof tempProduct?.height === 'number') {
        return tempProduct;
      }
    }
    throw new Error('Product with units not found.');
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
    const shipTo: Address = CommonProcessor.createAddress(
      transactionDetails.shipTo,
      billTo
    );
    const items = this.getOrderItems(arr);
    if (items.length === 0) {
      throw new Error(`Cannot create items for transaction`);
    }
    const amountPaid = this.getAmountPaidForItems(items);
    const productWithUnits = this.getProductWithUnits(items);
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
        height: productWithUnits.height,
        width: productWithUnits.width,
        length: productWithUnits.length,
        units: productWithUnits.dimUnits,
      },
      weight: {
        units: productWithUnits.weightUnits,
        value: productWithUnits.weight,
        WeightUnits: productWithUnits.weight,
      },
      amountPaid,
      advancedOptions: {} as AdvancedOptions,
    };
    this.logger.debug(`Result: ${result.customerUsername}`);
    return result;
  }

  runPreProcessors(transactionDetails: TODO_ANY): TODO_ANY[] {
    let points = 0;
    let preProcessorMatch: PreProcessor | undefined;
    for (const preProcessor of this.preProcessors) {
      const [valid, pPoints] = preProcessor.canWork(transactionDetails);
      if (valid && pPoints > points) {
        points = pPoints;
        preProcessorMatch = preProcessor;
      }
    }
    if (preProcessorMatch) {
      return preProcessorMatch.process(transactionDetails);
    }
    return transactionDetails;
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
    const preProcessedTransactions = approvedTransactions.map(tr =>
      this.runPreProcessors(tr)
    );
    const orderTrans: OrderTransactionPair[] = [];
    const issuedTrans = new Set<TODO_ANY>();
    for (const transaction of preProcessedTransactions) {
      const originalApproved = approvedTransactions.find(tr => {
        if (Array.isArray(transaction)) {
          return tr === transaction;
        } else if (Array.isArray(tr)) {
          return tr.includes(transaction);
        }
        return tr === transaction;
      });
      try {
        let order = this.transformData(transaction);
        order = extraCase(order);
        orderTrans.push({
          order,
          transaction: originalApproved,
        });
      } catch (e) {
        this.logger.warn(`Error while transforming item`);
        this.logger.warn(e);
        await moveIssuedTransaction(originalApproved, e);
        const trs = Array.isArray(originalApproved)
          ? originalApproved
          : [originalApproved];
        trs.forEach(tr => issuedTrans.add(tr));
      }
    }
    const transformedFlat = approvedTransactions.flat();
    const result: ProcessorResult = {
      orderTrans,
      skipped: transactionDetails.filter(
        tr => !transformedFlat.includes(tr) && !issuedTrans.has(tr)
      ),
    };
    return Promise.resolve(result);
  }
}

export function extraCase(order: Order): Order {
  if (!order.items) {
    order.items = [];
  }
  if (!order.advancedOptions) {
    order.advancedOptions = {} as AdvancedOptions;
  }
  const isSealionDiveWatch =
    order.items.find(item => item.sku === 'SEALIONDIVEWATCH') !== undefined;
  if (isSealionDiveWatch) {
    order.advancedOptions!.customField1 = 'SEALION WATCH';
  }
  const isRaptorWatch =
    order.items.find(item => item.sku === 'RAPTORWATCH') !== undefined;
  if (isRaptorWatch) {
    order.advancedOptions.customField1 = 'RAPTOR WATCH';
  }
  return order;
}
