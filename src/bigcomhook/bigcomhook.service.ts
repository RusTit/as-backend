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

enum OrderStatus {
  Incomplete = 0,
  Pending = 1,
  AwaitingPayment = 7,
  AwaitingFulfillment = 11,
}

type TODO_ANY = any;
type OrderDataPair = {
  order: Order;
  transaction: string;
};

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
        let item = tagsList.get(option.display_value);
        if (!item) {
          item = this.getSubMatchTag(tagsList, option.display_value);
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
    return this.bigCommerceProxy.getOrder(orderId);
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
    const items = this.getOrderItems(productsBigCommerce);
    if (items.length === 0) {
      throw new Error(`Cannot create items for transaction`);
    }
    const amountPaid = this.getAmountPaidForItems(items);
    const dimensions = this.getDimensions(productsBigCommerce);
    const weight = this.getWeight(productsBigCommerce);

    const transactionId = orderBigCommerce.payment_provider_id;
    const orderBase: Order = {
      billTo: billing_address,
      customerUsername: this.getCustomerName(orderBigCommerce.billing_address),
      customerEmail: orderBigCommerce.billing_address.email,
      orderDate: new Date(orderBigCommerce.date_created).toJSON(),
      paymentDate: new Date(orderBigCommerce.date_modified).toJSON(),
      orderNumber: orderId.toString(),
      orderStatus: 'awaiting_shipment',
      paymentMethod: orderBigCommerce.payment_method,
      shipTo: shipping_address,
      tagIds: this.getTagsIds(tagsList, productsBigCommerce),
      amountPaid,
      dimensions,
      weight,
    };
    const result: OrderDataPair[] = [];
    for (let index = 0; index < items.length; ++index) {
      const item = items[index];
      const orderIter: Order = {
        items: [item],
        ...orderBase,
      };
      orderIter.orderNumber += `-${index + 1}`;
      result.push({
        order: orderIter,
        transaction: transactionId,
      });
    }
    return result;
  }

  isValidStatusId(payload: WebhookUpdatedDto): boolean {
    const { new_status_id, previous_status_id } = payload.data.status;
    Logger.log(`isValidStatusId: ${previous_status_id}, ${new_status_id}`);
    if (new_status_id == OrderStatus.AwaitingFulfillment) {
      switch (previous_status_id) {
        case OrderStatus.Incomplete:
        case OrderStatus.Pending:
        case OrderStatus.AwaitingPayment:
          return true;
      }
    }
    return false;
  }

  async handleHook(payload: WebhookUpdatedDto): Promise<void> {
    if (this.isValidStatusId(payload)) {
      let transactionId = '';
      try {
        Logger.debug(payload);
        Logger.debug('Get bigcommerce order');
        const orderBigCommerce = await this.getBigCommerceOrder(
          payload.data.id.toString(),
        );
        Logger.debug('Bigcommerce order object');
        Logger.debug(orderBigCommerce);
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
        const dbProcessed = new TransactionProcessedEntity();
        dbProcessed.transactionId = transactionId;
        dbProcessed.orderObject = shipStationResponses;
        dbProcessed.labelObject = {
          todo: 'temp stub',
        };
        await this.transactionProcessedEntity.save(dbProcessed);
      } catch (e) {
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
        throw e;
      }
    } else {
      Logger.debug(
        `Skipping: prev: ${payload.data.status.previous_status_id}, new: ${payload.data.status.new_status_id}`,
      );
    }
  }
}
