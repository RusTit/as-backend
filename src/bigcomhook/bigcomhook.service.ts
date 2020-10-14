import { Inject, Injectable, Logger } from '@nestjs/common';
import BigCommerceProxy from './BigCommerceProxy';
import { Repository } from 'typeorm';
import { WebhookUpdatedDto } from './dtos';
import {
  Address,
  AdvancedOptions,
  Dimensions,
  ItemOption,
  Order,
  OrderItem,
  Weight,
} from './ShipStationTypes';
import { ProductTag, ShipStationProxy } from './ShipStationProxy';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionIssuesEntity } from '../transactions-issues/TransactionIssues.entity';
import { TransactionProcessedEntity } from '../transactions-processed/TransactionProcessed.entity';
import { GroupingService } from '../grouping/grouping.service';
import anymatch, { Matcher } from 'anymatch';
import { GroupEntity } from '../grouping/Group.entity';

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
colorSpecialCases.set('Dark Walnut', 'Walnut');
export function convertColorName(name: string): string {
  if (colorSpecialCases.has(name)) {
    return colorSpecialCases.get(name) as string;
  }
  return name;
}

const EXTRA_PARTS_CATEGORY = 33;
export const WHITE_LIST_CATEGORIES_NOT_SPLIT = [EXTRA_PARTS_CATEGORY];

export function helperClearItemTaxAndShipping(items: OrderItem[]): OrderItem[] {
  return items.map((item) => {
    item.taxAmount = undefined;
    item.shippingAmount = undefined;
    return item;
  });
}

export function extraCase(order: Order, productsArr: any[]): Order {
  const isExtraParts =
    productsArr.find((product) => product._meta.is_extra_part) !== undefined;
  if (isExtraParts) {
    order.advancedOptions.customField1 = 'Misc Shipping';
    return order;
  }
  const isSealionDiveWatch =
    order.items.find((item) => item.sku === 'SEALIONDIVEWATCH') !== undefined;
  if (isSealionDiveWatch) {
    order.advancedOptions.customField1 = 'SEALION WATCH';
  }
  const isRaptorWatch =
    order.items.find((item) => item.sku === 'RAPTORWATCH') !== undefined;
  if (isRaptorWatch) {
    order.advancedOptions.customField1 = 'RAPTOR WATCH';
  }
  return order;
}

export function getSizeFromName(value: string, group?: GroupEntity): string {
  if (group?.name !== 'Mantle') {
    return '';
  }
  return value.split(' ')[0] + 'ft';
}

const lockTypes = new Map<string, string>();

lockTypes.set('Rustic Racks', 'BT');

lockTypes.set('Liberty Rustic Pistol', 'BT');
lockTypes.set('The Liberty 35S', 'BT'); // 36944

lockTypes.set('TT Defender', 'BT'); // 194646
lockTypes.set('Defender Rustic Rifle', 'BT');
lockTypes.set('The Defender 45R', 'BT'); // 36930

lockTypes.set('36C Contemporary Pistol', 'BT');
lockTypes.set('The 36C Shelf', 'BT');

lockTypes.set('47C Contemporary Rifle', 'BT');
lockTypes.set('The 47C Shelf', 'BT');

lockTypes.set('Guardian Tactical Frame', 'BT'); // 36934
lockTypes.set('Guardian Frames', 'BT');
lockTypes.set('Guardian Frame', 'BT'); // 194734, 194729

lockTypes.set('Tactical End Table', 'BT');

lockTypes.set('1791 Whiskey Barrel Flag MAX', 'BIO'); // 36940
lockTypes.set('1791 Whiskey Barrel Flag', 'BT'); // 36940
lockTypes.set('1791 Whiskey Flag', 'BT');
lockTypes.set('Flag 1791', 'BT'); // 194730

lockTypes.set('The Tactical Barrel', 'BT');
lockTypes.set('Barrel Heads', 'BT');

lockTypes.set('MAX flags', 'BIO');

lockTypes.set('Mantles', 'BIO');
lockTypes.set('Mantle', 'BIO'); // 37079

lockTypes.set('Table', 'BT'); // 37081;

lockTypes.set('Freedom Rifle', 'RFID');
lockTypes.set('Rack', 'BT');

export function getLockTypeFromName(name: string): string {
  if (name.includes('BT')) {
    return 'BT';
  } else if (name.includes('BIO')) {
    return 'BIO';
  } else if (name.includes('RFID')) {
    return 'RFID';
  }
  for (const [key, value] of lockTypes) {
    if (name.includes(key)) {
      return value;
    }
  }
  return 'RFID';
}

const specificColors = new Map<string, string>();
specificColors.set('"Old Glory" Red & Blue Rustic Flag', 'Traditional');
specificColors.set('"Old Glory" Torched Rustic Flag', 'Torched');
specificColors.set('TT Flag 1791', '1791');
specificColors.set('The 1791 Whiskey Barrel Flag - Special Edition', '1791');
specificColors.set('1791 Whiskey Barrel Flag MAX', '1791 MAX');
specificColors.set('Gunstock and Steel Flag', 'Gunstock');
specificColors.set('Tactical Flag Barnwood Edition', 'Barnwood');
specificColors.set('"Thin Blue Line" Rustic Flag', 'Blue Line');
specificColors.set('"Thin Red Line" Rustic Flag', 'Red Line');
specificColors.set('The Betsy Ross Rustic Tactical Flag', 'Betsy Ross');
specificColors.set('The 4 Laws Tactical Flag', '4 Laws');
specificColors.set('The Tactical Flag "Moonshine" Edition', 'Moonshine');
specificColors.set(
  'Elite Military Special Edition Tactical Flag',
  'Elite Military',
);
specificColors.set('The Rustic Rosegold Tactical Flag', 'Rosegold');

export function getColorFromName(name: string): string {
  for (const [key, value] of specificColors) {
    if (name.includes(key)) {
      return value;
    }
  }
  return '';
}

@Injectable()
export class BigcomhookService {
  constructor(
    @InjectRepository(TransactionIssuesEntity)
    private transactionIssuesEntity: Repository<TransactionIssuesEntity>,
    @InjectRepository(TransactionProcessedEntity)
    private transactionProcessedEntity: Repository<TransactionProcessedEntity>,
    @Inject('ShipStationProxy') private shipStationProxy: ShipStationProxy,
    @Inject('BigCommerceProxy') private bigCommerceProxy: BigCommerceProxy,
    private readonly groupingService: GroupingService,
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
    // const colors = Array.from(this.shipStationProxy.tagsList.keys());
    return productsBigCommerce.map(
      (product: TODO_ANY): OrderItem => {
        const weight = parseFloat(product.weight);
        const itemOptions: ItemOption[] = product.product_options
          // .filter((option) => colors.includes(option.display_value))
          .map(
            (option: TODO_ANY): ItemOption => {
              return {
                name:
                  option.display_name === 'Select Finish:'
                    ? 'Color'
                    : option.display_name,
                value: option.display_value,
              };
            },
          );
        let name = product.name;
        if (name === 'The Tactical Barrel') {
          const parts = product.product_options.map((option) => {
            return `${option.display_name}:${option.display_value}`;
          });
          name = `${name} ${parts.join(' ')}`;
        }
        return {
          name,
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
          taxAmount: parseFloat(product.price_tax),
        };
      },
    );
  }

  protected getTaxAmount(items: OrderItem[]): number {
    let total = 0;
    items.forEach((item) => {
      if (Number.isFinite(item.taxAmount)) {
        total += item.taxAmount * item.quantity;
      }
    });
    return total;
  }

  protected getShippingAmount(items: OrderItem[]): number {
    let total = 0;
    items.forEach((item) => {
      if (Number.isFinite(item.shippingAmount)) {
        total += item.shippingAmount * item.quantity;
      }
    });
    return total;
  }

  protected getAmountPaidForItems(items: OrderItem[]): number {
    let total = 0;
    items.forEach((item) => {
      if (Number.isFinite(item.unitPrice)) {
        total += item.unitPrice * item.quantity;
      }
      if (Number.isFinite(item.shippingAmount)) {
        total += item.shippingAmount * item.quantity;
      }
      if (Number.isFinite(item.taxAmount)) {
        total += item.taxAmount * item.quantity;
      }
    });
    return total;
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
        color = convertColorName(color);
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
        item._meta = {
          is_extra_part: categories.includes(EXTRA_PARTS_CATEGORY),
        };
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
    let index = 0;
    const allItems = this.getOrderItems(productsBigCommerce);
    const amountPaid = this.getAmountPaidForItems(allItems);
    for (const productOrArr of splitBGProducts) {
      ++index;
      const products = Array.isArray(productOrArr)
        ? productOrArr
        : [productOrArr];
      const items = this.getOrderItems(products);
      if (items.length === 0) {
        throw new Error(`Cannot create items for transaction`);
      }
      const shippingAmount = this.getShippingAmount(items);
      const taxAmount = this.getTaxAmount(items);
      const dimensions = this.getDimensions(products);
      const weight = this.getWeight(products);
      const cleanedItems = helperClearItemTaxAndShipping(items);
      let order: Order = {
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
        taxAmount,
        shippingAmount,
        dimensions,
        weight,
        items: cleanedItems,
        advancedOptions: {} as AdvancedOptions,
      };
      order = extraCase(order, products);
      if (splitBGProducts.length > 1) {
        order.orderNumber += `-${index}/${splitBGProducts.length}`;
      }
      result.push({
        order,
        transaction: transactionId,
      });
    }
    return result;
  }

  async postProcessOrders(
    orderDataPairs: OrderDataPair[],
  ): Promise<OrderDataPair[]> {
    const groups = await this.groupingService.findAll(0, 1000);
    return orderDataPairs.map((pair) => {
      const { order } = pair;
      if (
        !order.items ||
        order.items.length === 0 ||
        order.advancedOptions.customField1
      ) {
        return pair;
      }
      const sortedGroups = groups.sort(
        (a, b) =>
          b.productNameGlob.length +
          b.productSkuGlob.length -
          (a.productNameGlob.length + a.productSkuGlob.length),
      );
      for (const group of sortedGroups) {
        const { productNameGlob, productSkuGlob } = group;
        let productNameMatcher: Matcher = productNameGlob;
        if (!productNameGlob.includes('*')) {
          productNameMatcher = (val: string): boolean =>
            val.includes(productNameGlob);
        }
        let productSkuMatcher: Matcher = productSkuGlob;
        if (!productSkuGlob.includes('*')) {
          productSkuMatcher = (val: string): boolean =>
            val.includes(productSkuGlob);
        }
        if (
          anymatch(
            productNameMatcher,
            order.items.map((item) => item.name),
          ) &&
          anymatch(
            productSkuMatcher,
            order.items.map((item) => item.sku),
          )
        ) {
          if (!order.advancedOptions.customField1) {
            const name = group.customName ? group.customName : group.name;
            const [firstItem] = order.items; // assuming to process only FIRST item
            const colorOption = firstItem.options.find(
              (option) => option.name === 'color' || option.name === 'Color',
            );
            let color = colorOption ? convertColorName(colorOption.value) : '';
            if (!color) {
              color = getColorFromName(firstItem.name);
            }
            const sizeOption = firstItem.options.find(
              (option) => option.name === 'size' || option.name === 'Size',
            );
            const size = sizeOption
              ? getSizeFromName(sizeOption.value, group)
              : '';

            let lockType: string;
            switch (group.name) {
              case 'Pistol':
              case 'Compact':
                if (firstItem.name?.includes('Bluetooth')) {
                  lockType = 'BT';
                } else {
                  lockType = getLockTypeFromName(firstItem.name as string);
                }
                break;
              default:
                lockType = getLockTypeFromName(firstItem.name as string);
            }
            const value = [name, `${size} ${color}`.trim(), lockType.trim()]
              .filter((s) => s)
              .join(' - ');

            switch (group.fieldName) {
              default:
              case 'customField1':
                order.advancedOptions.customField1 = value;
                break;
              case 'customField2':
                order.advancedOptions.customField2 = value;
                break;
              case 'customField3':
                order.advancedOptions.customField3 = value;
                break;
            }
          } else {
            Logger.debug(`Skipping group: ${group.name}. Already processed.`);
          }
        }
      }
      return pair;
    });
  }

  async createShipStationOrder(orderId: number): Promise<void> {
    let transactionId = '';
    try {
      Logger.debug('Get bigcommerce order');
      const orderBigCommerce = await this.getBigCommerceOrder(
        orderId.toString(),
      );
      transactionId = orderBigCommerce.payment_provider_id;
      Logger.debug(`Processing transaction id: ${transactionId}`);
      if (!(await this.checkTheBigCommerceOrder(orderBigCommerce))) {
        Logger.warn(`Can't process this kind of transactions.`);
        return;
      }
      await this.shipStationProxy.init();
      const orderDataPairs = await this.generateOrders(
        orderId,
        orderBigCommerce,
        this.shipStationProxy.tagsList,
      );
      const processedOrderDataPair = await this.postProcessOrders(
        orderDataPairs,
      );
      const shipStationResponses = await Promise.all(
        processedOrderDataPair.map(async ({ order }) => {
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
        Logger.warn(`Order: ${orderId} has not transaction id.`);
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

  async deleteShipStationOrder(orderNumber: number): Promise<void> {
    Logger.debug(`Processing refund/voided orderNumber BG: ${orderNumber}`);
    try {
      const orderBigCommerce = await this.getBigCommerceOrder(
        orderNumber.toString(),
      );
      if (orderBigCommerce.status_id === OrderStatus.PartiallyRefunded) {
        return Logger.debug(
          `Order: ${orderNumber} is partially refunded, so no need to delete ShipStation order.`,
        );
      }
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

  async handleStatusUpdated(payload: WebhookUpdatedDto): Promise<void> {
    const { new_status_id, previous_status_id } = payload.data.status;
    Logger.log(`handleHook: ${previous_status_id}, ${new_status_id}`);
    if (new_status_id == OrderStatus.AwaitingFulfillment) {
      switch (previous_status_id) {
        case OrderStatus.Incomplete:
        case OrderStatus.Pending:
        case OrderStatus.AwaitingPayment:
          return this.createShipStationOrder(payload.data.id);
      }
    }
    switch (new_status_id) {
      case OrderStatus.Refunded:
      case OrderStatus.Cancelled:
      case OrderStatus.Declined:
        return this.deleteShipStationOrder(payload.data.id);
      case OrderStatus.PartiallyRefunded:
        return this.processPartialRefunded(payload.data.id);
    }
    Logger.debug(
      `Skipping: prev: ${payload.data.status.previous_status_id}, new: ${payload.data.status.new_status_id}`,
    );
  }

  async processPartialRefunded(orderId: number): Promise<void> {
    try {
      Logger.debug('Get bigcommerce order');
      const orderBigCommerce = await this.getBigCommerceOrder(
        orderId.toString(),
      );
      const totalIncTax = Number.parseFloat(orderBigCommerce.total_inc_tax);
      const refundedAmount = Number.parseFloat(
        orderBigCommerce.refunded_amount,
      );
      if (!Number.isFinite(totalIncTax) || !Number.isFinite(refundedAmount)) {
        Logger.error(orderBigCommerce);
        throw new Error('Invalid value for prices values');
      }
      const amountPaid = totalIncTax - refundedAmount;
      await this.shipStationProxy.init();
      const orders = await this.shipStationProxy.getListOrders({
        orderNumber: `${orderId}`,
        pageSize: `500`, // to avoid paging issues
      });
      await Promise.all(
        orders.map(async (order) => {
          order.amountPaid = amountPaid;
          order.customerNotes = `Refunded ($${refundedAmount})`;
          return this.shipStationProxy.createOrUpdateOrder(order);
        }),
      );
    } catch (e) {
      Logger.error(`Error while processing partial refunded: ${orderId}`);
      Logger.error(e);
    }
  }

  async handleHook(payload: WebhookUpdatedDto): Promise<void> {
    Logger.debug(payload);
    switch (payload.scope) {
      case 'store/order/statusUpdated':
        return this.handleStatusUpdated(payload);
      case 'store/order/refund/created':
        return this.deleteShipStationOrder(payload.data.id);
    }
    Logger.debug(`Hook didn't processed the payload.`);
  }
}
