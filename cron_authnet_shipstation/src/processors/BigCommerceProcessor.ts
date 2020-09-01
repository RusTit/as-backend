import BigCommerceProxy from '../BigCommerceProxy';
import Processor, { OrderTransactionPair, ProcessorResult } from './Processor';
import { TODO_ANY } from '../Helper';
import { isApprovedTransaction } from '../filters';
import {
  Address,
  Dimensions,
  ItemOption,
  Order,
  OrderItem,
  Weight,
} from '../ShipStationTypes';
import { ProductTag } from '../ShipStationProxy';

export function isBigCommerceTransaction(transaction: TODO_ANY): boolean {
  return transaction.solution?.name?.toLowerCase().includes('bigcommerce');
}

export default class BigCommerceProcessor extends Processor {
  private readonly bigCommerceProxy: BigCommerceProxy;
  private readonly tagsList: Map<string, ProductTag>;

  constructor(
    store_hash: string,
    client_id: string,
    access_token: string,
    tagsList: Map<string, ProductTag>
  ) {
    super('BigCommerceProcessor');
    this.bigCommerceProxy = new BigCommerceProxy(
      store_hash,
      client_id,
      access_token
    );
    this.tagsList = tagsList;
  }

  async process(transactionDetails: TODO_ANY[]): Promise<ProcessorResult> {
    this.logger.info(`Total transactions count: ${transactionDetails.length}`);
    const bigCommerceTransactions = transactionDetails.filter(
      isBigCommerceTransaction
    );
    this.logger.info(
      `BigCommerce total transactions count: ${bigCommerceTransactions.length}`
    );
    const approvedTransactions = bigCommerceTransactions.filter(
      isApprovedTransaction
    );
    this.logger.info(
      `Approved transactions count: ${approvedTransactions.length}`
    );
    const orderTrans: OrderTransactionPair[] = [];
    const processed: TODO_ANY[] = [];
    await Promise.all(
      approvedTransactions.map(
        async (transaction: TODO_ANY): Promise<void> => {
          try {
            const order = await this.transformData(transaction);
            orderTrans.push({
              order,
              transaction,
            });
            processed.push(transaction);
          } catch (e) {
            this.logger.warn(`Error while transforming item`);
            this.logger.warn(e);
          }
        }
      )
    );
    const skipped: TODO_ANY[] = transactionDetails.filter(
      tr => !processed.includes(tr)
    );
    return {
      skipped,
      orderTrans,
    };
  }

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
          }
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
      }
    );
  }

  getWeight(productsBigCommerce: Array<TODO_ANY>): Weight | undefined {
    const firstWithWeight = productsBigCommerce.find(product => product.weight);
    if (firstWithWeight) {
      const value = parseFloat(firstWithWeight.weight);
      return {
        units: 'pounds',
        value,
        WeightUnits: value,
      } as Weight;
    }
  }

  getDimensions(productsBigCommerce: Array<TODO_ANY>): Dimensions | undefined {
    const firstWithDimensions = productsBigCommerce.find(
      product => product.width && product.height && product.depth
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

  getTagsIds(productsBigCommerce: Array<TODO_ANY>): number[] {
    const tags: Set<number> = new Set();
    for (const product of productsBigCommerce) {
      product.product_options.forEach((option: TODO_ANY) => {
        const item = this.tagsList.get(option.display_value);
        if (item) {
          tags.add(item.tagId);
        }
      });
    }
    return [...tags.values()];
  }

  async transformData(transactionDetails: TODO_ANY): Promise<Order> {
    const orderId: string = transactionDetails.order.invoiceNumber;
    // const orderId = '33932';
    const orderBigCommerce = await this.bigCommerceProxy.getOrder(orderId);
    const billing_address: Address = this.getAddress(
      orderBigCommerce.billing_address
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
    const order: Order = {
      billTo: billing_address,
      customerUsername: this.getCustomerName(orderBigCommerce.billing_address),
      customerEmail: orderBigCommerce.billing_address.email,
      orderDate: `${transactionDetails.submitTimeUTC}`,
      paymentDate: transactionDetails.batch?.settlementTimeUTC,
      orderNumber: orderId,
      orderStatus: 'awaiting_shipment',
      paymentMethod: this.getPaymentMethod(transactionDetails),
      shipTo: shipping_address,
      tagIds: this.getTagsIds(productsBigCommerce),
      items,
      amountPaid,
      dimensions,
      weight,
      internalNotes: transactionDetails.order?.description,
    };
    this.logger.debug(
      `Result: ${order.customerUsername} #${order.orderNumber}`
    );
    return order;
  }
}
