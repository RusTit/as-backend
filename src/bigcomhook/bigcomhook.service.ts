import { Inject, Injectable, Logger } from '@nestjs/common';
import BigCommerceProxy from './BigCommerceProxy';
import { Repository } from 'typeorm';
import { WebhookUpdatedDto } from './dtos';
import {
  Address,
  ItemOption,
  OrderItem,
  Dimensions,
  Order,
  Weight,
} from './ShipStationTypes';
import { ShipStationProxy, ProductTag } from './ShipStationProxy';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';

// https://developer.bigcommerce.com/api-reference/orders/orders-api/order-status/getorderstatus
export enum OrderStatus {
  Incomplete = 0,
  Pending = 1,
  Shipped = 2,
  PartiallyShipped = 3,
  Refunded = 4,
  Cancelled = 5,
  Declined = 6,
  AwaitingPayment = 7,
  AwaitingPickup = 8,
  AwaitingShipment = 9,
  Completed = 10,
  AwaitingFulfillment = 11,
  ManualVerificationRequired = 12,
  Disputed = 13,
  PartiallyRefunded = 14,
}

type TODO_ANY = any;
type OrderDataPair = {
  order: Order;
  transaction: string;
};

export const colorSpecialCases = new Map<string, string>();
colorSpecialCases.set('Country-Pine', 'Country Pine');
export function converColorName(name: string): string {
  if (colorSpecialCases.has(name)) {
    return colorSpecialCases.get(name) as string;
  }
  return name;
}

export const WHITE_LIST_CATEGORIES_NOT_SPLIT = [33];

@Injectable()
export class BigcomhookService {
  constructor(
    @InjectRepository(TransactionIssuesEntity)
    private transactionIssuesEntity: Repository<TransactionIssuesEntity>,
    @InjectRepository(TransactionProcessedEntity)
    private transactionProcessedEntity: Repository<TransactionProcessedEntity>,
    @Inject('ShipStationProxy') private shipStationProxy: ShipStationProxy,
    @Inject('BigCommerceProxy') private bigCommerceProxy: BigCommerceProxy,
  ) {}

  getCustomerName(bigCommerceAddress: TODO_ANY): string {
    return `${bigCommerceAddress.first_name} ${bigCommerceAddress.last_name}`;
  }

  getAddress(bigCommerceAddress: TODO_ANY): Address {
    if (Array.isArray(bigCommerceAddress)) {
      bigCommerceAddress = bigCommerceAddress[0];
    }
    return {
      addressVerified: 'Address not yet validated',
      city: bigCommerceAddress.city,
      company: bigCommerceAddress.company,
      country: bigCommerceAddress.country_iso2,
      name: this.getCustomerName(bigCommerceAddress),
      phone: bigCommerceAddress.phone,
      postalCode: bigCommerceAddress.zip,
      residential: '',
      state: bigCommerceAddress.state,
      street1: bigCommerceAddress.street_1,
      street2: bigCommerceAddress.street_2,
      street3: '',
    };
  }

  getOrderItems(productsBigCommerce: Array<TODO_ANY>): OrderItem[] {
    return productsBigCommerce.map(
      (product: TODO_ANY): OrderItem => {
        const weight = parseFloat(product.weight);
        const itemOptions: ItemOption[] = product.product_options.map(
          (option: TODO_ANY): ItemOption => {
            return {
              name: 'color',
              value: option.display_value,
            };
          },
        );
        return {
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          unitPrice: parseFloat(product.base_price),
          weight: {
            units: 'pounds',
            value: weight,
            WeightUnits: weight,
          },
          options: itemOptions,
          shippingAmount: parseFloat(product.fixed_shipping_cost),
        };
      },
    );
  }

  protected getAmountPaidForItems(items: OrderItem[]): number {
    let amountPaid = 0;
    items.forEach((item) => {
      const unitPrice =
        typeof item.unitPrice === 'undefined' ? 0 : item.unitPrice;
      const shippingAmount =
        typeof item.shippingAmount === 'undefined' ? 0 : item.shippingAmount;
      amountPaid = amountPaid + unitPrice + shippingAmount;
    });
    return amountPaid;
  }

  getDimensions(productsBigCommerce: Array<TODO_ANY>): Dimensions | undefined {
    const firstWithDimensions = productsBigCommerce.find(
      (product) => product.width && product.height && product.depth,
    );
    if (firstWithDimensions) {
      return {
        units: 'inches',
        width: parseFloat(firstWithDimensions.width),
        height: parseFloat(firstWithDimensions.height),
        length: parseFloat(firstWithDimensions.depth),
      } as Dimensions;
    }
  }

  getWeight(productsBigCommerce: Array<TODO_ANY>): Weight | undefined {
    const firstWithWeight = productsBigCommerce.find(
      (product) => product.weight,
    );
    if (firstWithWeight) {
      const value = parseFloat(firstWithWeight.weight);
      return {
        units: 'pounds',
        value,
        WeightUnits: value,
      } as Weight;
    }
  }

  getSubMatchTag(
    tagsList: Map<string, ProductTag>,
    color: string,
  ): ProductTag | undefined {
    const keys = tagsList.keys();
    let keyMatch: string | undefined = undefined;
    for (const key of keys) {
      if (color.includes(key)) {
        keyMatch = key;
      }
    }
    if (keyMatch) {
      return tagsList.get(keyMatch);
    }
  }

  getTagsIds(
    tagsList: Map<string, ProductTag>,
    productsBigCommerce: Array<TODO_ANY>,
  ): number[] {
    const tags: Set<number> = new Set();
    for (const product of productsBigCommerce) {
      product.product_options.forEach((option: TODO_ANY) => {
        let color = option.display_value;
        color = converColorName(color);
        let item = tagsList.get(color);
        if (!item) {
          item = this.getSubMatchTag(tagsList, color);
        }
        if (item) {
          tags.add(item.tagId);
        }
      });
    }
    return [...tags.values()];
  }

  async checkTheBigCommerceOrder(orderBigCommerce: TODO_ANY): Promise<boolean> {
    /*    if (orderBigCommerce.payment_method === 'Amazon Pay') {
      throw new Error(`Amazon Pay transaction`);
    }*/
    return true;
  }

  async getBigCommerceOrder(orderId: string): Promise<TODO_ANY> {
    const orderBigCommerce = await this.bigCommerceProxy.getOrder(orderId);
    Logger.debug('Bigcommerce order object');
    Logger.debug(orderBigCommerce);
    return orderBigCommerce;
  }

  async splitProductsIntoIndividuals(
    productsBigCommerce: any[],
  ): Promise<any[]> {
    const result = [];
    const sameOrder = [];
    await Promise.all(
      productsBigCommerce.map(async (item) => {
        const productDetails = await this.bigCommerceProxy.getProductDetails(
          item.product_id,
        );
        const categories: number[] = productDetails.data.categories;
        const shouldSkip =
          categories.find((cat) =>
            WHITE_LIST_CATEGORIES_NOT_SPLIT.includes(cat),
          ) !== undefined;
        if (shouldSkip) {
          sameOrder.push(item);
        } else {
          const quantity = item.quantity;
          item.quantity = 1;
          for (let i = 0; i < quantity; ++i) {
            result.push(item);
          }
        }
      }),
    );
    if (sameOrder.length) {
      result.push(sameOrder);
    }
    return result;
  }

  async generateOrders(
    orderId: number,
    orderBigCommerce: TODO_ANY,
    tagsList: Map<string, ProductTag>,
  ): Promise<OrderDataPair[]> {
    const billing_address: Address = this.getAddress(
      orderBigCommerce.billing_address,
    );
    const [shippingBigCommerce, productsBigCommerce] = await Promise.all([
      this.bigCommerceProxy.getShippingAddress(orderBigCommerce),
      this.bigCommerceProxy.makeRawRequest(orderBigCommerce.products.url),
    ]);
    const shipping_address = shippingBigCommerce
      ? this.getAddress(shippingBigCommerce)
      : billing_address;
    const transactionId = orderBigCommerce.payment_provider_id;
    const result: OrderDataPair[] = [];
    const splitBGProducts = await this.splitProductsIntoIndividuals(
      productsBigCommerce,
    );
    for (const productOrArr of splitBGProducts) {
      const products = Array.isArray(productOrArr)
        ? productOrArr
        : [productOrArr];
      const items = this.getOrderItems(products);
      if (items.length === 0) {
        throw new Error(`Cannot create items for transaction`);
      }
      const amountPaid = this.getAmountPaidForItems(items);
      const dimensions = this.getDimensions(products);
      const weight = this.getWeight(products);
      const order: Order = {
        billTo: billing_address,
        customerUsername: this.getCustomerName(
          orderBigCommerce.billing_address,
        ),
        customerEmail: orderBigCommerce.billing_address.email,
        orderDate: new Date(orderBigCommerce.date_created).toJSON(),
        paymentDate: new Date(orderBigCommerce.date_modified).toJSON(),
        orderNumber: orderId.toString(),
        orderStatus: 'awaiting_shipment',
        paymentMethod: orderBigCommerce.payment_method,
        shipTo: shipping_address,
        tagIds: this.getTagsIds(tagsList, products),
        amountPaid,
        dimensions,
        weight,
        items,
      };
      result.push({
        order,
        transaction: transactionId,
      });
    }
    return result;
  }

  async createShipStationOrder(payload: WebhookUpdatedDto): Promise<void> {
    let transactionId = '';
    try {
      Logger.debug(payload);
      Logger.debug('Get bigcommerce order');
      const orderBigCommerce = await this.getBigCommerceOrder(
        payload.data.id.toString(),
      );
      transactionId = orderBigCommerce.payment_provider_id;
      Logger.debug(`Processing transaction id: ${transactionId}`);
      if (!(await this.checkTheBigCommerceOrder(orderBigCommerce))) {
        Logger.warn(`Can't process this kind of transactions.`);
        return;
      }
      await this.shipStationProxy.init();
      const orderDataPairs = await this.generateOrders(
        payload.data.id,
        orderBigCommerce,
        this.shipStationProxy.tagsList,
      );
      const shipStationResponses = await Promise.all(
        orderDataPairs.map(async ({ order }) => {
          Logger.log(`Processing order: ${order.orderNumber}`);
          const shipStationResponse = await this.shipStationProxy.createOrUpdateOrder(
            order,
          );
          Logger.log(`Order saved: ${order.orderNumber}`);
          return shipStationResponse;
        }),
      );
      if (transactionId) {
        const dbProcessed = new TransactionProcessedEntity();
        dbProcessed.transactionId = transactionId;
        dbProcessed.orderObject = shipStationResponses;
        dbProcessed.labelObject = {
          todo: 'temp stub',
        };
        await this.transactionProcessedEntity.save(dbProcessed);
      } else {
        Logger.warn(`Order: ${payload.data.id} has not transaction id.`);
      }
    } catch (e) {
      Logger.error(e);
      if (transactionId) {
        const issue = e;
        const dbIssues = new TransactionIssuesEntity();
        dbIssues.transactionId = transactionId;
        dbIssues.issueObject = {
          error: issue,
          message: issue.message,
        };
        await this.transactionIssuesEntity.save(dbIssues);
      }
    }
  }

  async deleteShipStationOrder(payload: WebhookUpdatedDto): Promise<void> {
    const orderNumber = payload.data.id.toString();
    Logger.debug(`Processing refund/voided orderNumber BG: ${orderNumber}`);
    try {
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
    }
  }

  async handleHook(payload: WebhookUpdatedDto): Promise<void> {
    const { new_status_id, previous_status_id } = payload.data.status;
    Logger.log(`isValidStatusId: ${previous_status_id}, ${new_status_id}`);
    if (new_status_id == OrderStatus.AwaitingFulfillment) {
      switch (previous_status_id) {
        case OrderStatus.Incomplete:
        case OrderStatus.Pending:
        case OrderStatus.AwaitingPayment:
          return this.createShipStationOrder(payload);
      }
    }
    switch (new_status_id) {
      case OrderStatus.Refunded:
      case OrderStatus.Cancelled:
      case OrderStatus.Declined:
        return this.deleteShipStationOrder(payload);
    }
    Logger.debug(
      `Skipping: prev: ${payload.data.status.previous_status_id}, new: ${payload.data.status.new_status_id}`,
    );
  }
}
