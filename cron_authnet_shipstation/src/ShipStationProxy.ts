import needle, { NeedleOptions } from 'needle';
import Bottleneck from 'bottleneck';
import LoggerFactory from './logger';
import { Logger } from 'log4js';
import { TODO_ANY } from './Helper';
import { Order, LabelForOrder } from './ShipStationTypes';

const SHIPSTATION_DOMAIN = 'https://ssapi.shipstation.com';
const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  reservoir: 15, // initial value
  reservoirRefreshAmount: 15,
  reservoirRefreshInterval: 60 * 1000, // must be divisible by 250

  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 1,
  minTime: 1000, // pick a value that makes sense for your use case
} as const;

export interface ProductTag {
  tagId: number;
  name: string;
}

export class UnknownProduct extends Error {
  constructor(message?: string) {
    super(message);
  }
}

const NET_TIMEOUT = 30000;

export default class ShipStationProxy {
  private readonly needleOptions: NeedleOptions;
  private readonly limiter: Bottleneck;
  private readonly logger: Logger;
  public readonly tagsList: Map<string, ProductTag>;

  constructor(apiKey: string, apiSecret: string) {
    const authString = `${apiKey}:${apiSecret}`;
    const buff = Buffer.from(authString);
    const base64data = buff.toString('base64');
    this.needleOptions = {
      headers: {
        Authorization: `Basic ${base64data}`,
      },
      json: true,
      read_timeout: NET_TIMEOUT,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response_timeout: NET_TIMEOUT,
    };
    this.limiter = new Bottleneck(LIMITER_OPTIONS);
    this.logger = LoggerFactory('src/ShipStationProxy.ts');
    this.tagsList = new Map<string, ProductTag>();
    this.logger.debug(LIMITER_OPTIONS);
  }

  logApiLimits(response: needle.NeedleResponse): void {
    this.logger.debug(
      `API limits: limit ${response.headers['x-rate-limit-limit']}, remaining: ${response.headers['x-rate-limit-remaining']}, reset: ${response.headers['x-rate-limit-reset']}`
    );
  }

  async init(): Promise<void> {
    if (this.tagsList.size) {
      return;
    }
    const response = await this.limiter.schedule(async () =>
      needle(
        'get',
        `${SHIPSTATION_DOMAIN}/accounts/listtags`,
        null,
        this.needleOptions
      )
    );
    this.logApiLimits(response);
    if (response.statusCode === 200) {
      const { body } = response;
      for (const item of body) {
        const tagItem = item as ProductTag;
        this.tagsList.set(tagItem.name, tagItem);
      }
    } else {
      throw new Error(
        `Invalid response code: ${
          response.statusCode
        } with response: ${JSON.stringify(response.body)}`
      );
    }
  }

  async createOrUpdateOrder(orderPayload: Order): Promise<TODO_ANY> {
    const response = await this.limiter.schedule(() =>
      needle(
        'post',
        `${SHIPSTATION_DOMAIN}/orders/createorder`,
        orderPayload,
        this.needleOptions
      )
    );
    this.logApiLimits(response);
    if (response.statusCode === 200) {
      return response.body;
    } else {
      throw new Error(
        `Invalid response code: ${response.statusCode} for order: ${
          orderPayload.orderNumber
        } with response: ${JSON.stringify(response.body)}`
      );
    }
  }

  async createLabelForOrder(orderResponsePayload: TODO_ANY): Promise<TODO_ANY> {
    const labelForOrder: LabelForOrder = {
      carrierCode: '',
      confirmation: 'delivery',
      orderId: orderResponsePayload.orderId,
      serviceCode: '',
      shipDate: '',
      testLabel: false,
    };
    const response = await this.limiter.schedule(() =>
      needle(
        'post',
        `${SHIPSTATION_DOMAIN}/orders/createlabelfororder`,
        labelForOrder,
        this.needleOptions
      )
    );
    this.logApiLimits(response);
    if (response.statusCode === 200) {
      return response.body;
    } else {
      throw new Error(
        `Invalid response code: ${
          response.statusCode
        } with response: ${JSON.stringify(response.body)}`
      );
    }
  }
}
