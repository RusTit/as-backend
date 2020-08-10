export type OrderStatus =
  | 'awaiting_payment'
  | 'awaiting_shipment'
  | 'shipped'
  | 'on_hold'
  | 'cancelled';

export type AddressVerification =
  | 'Address not yet validated'
  | 'Address validated successfully'
  | 'Address validation warning'
  | 'Address validation failed';

/**
 * https://www.shipstation.com/docs/api/models/address/
 */
export interface Address {
  name: string;
  company: string;
  street1: string;
  street2: string;
  street3: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  residential: string;
  addressVerified: AddressVerification;
}

/**
 * https://www.shipstation.com/docs/api/models/item-option/
 */
export interface ItemOption {
  name: string;
  value: string;
}

export type Units = 'pounds' | 'ounces' | 'grams';

/**
 * https://www.shipstation.com/docs/api/models/weight/
 */
export interface Weight {
  value: number;
  units: Units;
  WeightUnits: number;
}

/**
 * https://www.shipstation.com/docs/api/models/order-item/
 */
export interface OrderItem {
  orderItemId?: number;
  lineItemKey?: string;
  sku?: string;
  name?: string;
  imageUrl?: string;
  weight?: Weight;
  quantity?: number;
  unitPrice?: number;
  taxAmount?: number;
  shippingAmount?: number;
  warehouseLocation?: string;
  options?: ItemOption[];
  productId?: number;
  fulfillmentSku?: string;
  adjustment?: boolean;
  upc?: string;
  createDate?: string;
  modifyDate?: string;
}

export type DimensionUnits = 'inches' | 'centimeters';

/**
 * https://www.shipstation.com/docs/api/models/dimensions/
 */
export interface Dimensions {
  length: number;
  width: number;
  height: number;
  units: DimensionUnits;
}

export type InsuranceProvider = 'shipsurance' | 'carrier' | 'provider';

/**
 * https://www.shipstation.com/docs/api/models/insurance-options/
 */
export interface InsuranceOptions {
  provider: InsuranceProvider;
  insureShipment: boolean;
  insuredValue: number;
}

export type InternationalOptionsContents =
  | 'merchandise'
  | 'documents'
  | 'gift'
  | 'returned_goods'
  | 'sample';
export type InternationalOptionsNonDelivery =
  | 'return_to_sender'
  | 'treat_as_abandoned';

/**
 * https://www.shipstation.com/docs/api/models/customs-item/
 */
export interface CustomsItem {
  customsItemId: string;
  description: string;
  quantity: number;
  value: number;
  harmonizedTariffCode: string;
  countryOfOrigin: string;
}

/**
 * https://www.shipstation.com/docs/api/models/international-options/
 */
export interface InternationalOptions {
  contents: InternationalOptionsContents;
  customsItems: Array<CustomsItem>;
  nonDelivery: InternationalOptionsNonDelivery;
}

/**
 * https://www.shipstation.com/docs/api/models/advanced-options/
 */
export interface AdvancedOptions {
  warehouseId: number;
  nonMachinable: boolean;
  saturdayDelivery: boolean;
  containsAlcohol: boolean;
  storeId: number;
  customField1: string;
  customField2: string;
  customField3: string;
  source: string;
  mergedOrSplit: boolean;
  mergedIds: number[];
  parentId: number;
  billToParty: string;
  billToAccount: string;
  billToPostalCode: string;
  billToCountryCode: string;
  billToMyOtherAccount: string;
}

/**
 * https://www.shipstation.com/docs/api/orders/create-update-order/
 */
export interface Order {
  orderNumber: string;
  orderKey?: string;
  orderDate: string;
  paymentDate?: string;
  shipByDate?: string;
  orderStatus: OrderStatus;
  customerUsername?: string;
  customerEmail?: string;
  billTo: Address;
  shipTo: Address;
  items?: Array<OrderItem>;
  amountPaid?: number;
  taxAmount?: number;
  shippingAmount?: number;
  customerNotes?: string;
  internalNotes?: string;
  gift?: boolean;
  giftMessage?: string;
  paymentMethod?: string;
  requestedShippingService?: string;
  carrierCode?: string;
  serviceCode?: string;
  packageCode?: string;
  confirmation?: string;
  shipDate?: string;
  weight?: Weight;
  dimensions?: Dimensions;
  insuranceOptions?: InsuranceOptions;
  internationalOptions?: InternationalOptions;
  advancedOptions?: AdvancedOptions;
  tagIds: number[];
}

export type LabelConfirmation =
  | 'none'
  | 'delivery'
  | 'signature'
  | 'adult_signature'
  | 'direct_signature';

/**
 * https://www.shipstation.com/docs/api/orders/create-label/
 */
export interface LabelForOrder {
  orderId: number;
  carrierCode: string;
  serviceCode: string;
  confirmation: LabelConfirmation;
  shipDate: string;
  weight?: Weight;
  dimensions?: Dimensions;
  insuranceOptions?: InsuranceOptions;
  internationalOptions?: InternationalOptions;
  advancedOptions?: AdvancedOptions;
  testLabel: boolean;
}

export interface Product {
  name: string;
  sku: string;
  width: number;
  height: number;
  length: number;
  dimUnits: DimensionUnits;
  weight: number;
  weightUnits: Units;
}
