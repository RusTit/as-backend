import * as needle from 'needle';
import { NeedleOptions } from 'needle';
import Bottleneck from 'bottleneck';
import { Order, LabelForOrder, ListOrdersQuery } from './ShipStationTypes';
import { Logger } from '@nestjs/common';

export type TODO_ANY = any;

const SHIPSTATION_DOMAIN = 'https://ssapi.shipstation.com';
const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  reservoir: 30, // initial value
  reservoirRefreshAmount: 30,
  reservoirRefreshInterval: 60 * 1000, // must be divisible by 250

  // also use maxConcurrent and/or minTime for safety
  // maxConcurrent: 1,
  minTime: 10, // pick a value that makes sense for your use case
};

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

export class ShipStationProxy {
  private readonly needleOptions: NeedleOptions;
  private readonly limiter: Bottleneck;
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
    this.tagsList = new Map<string, ProductTag>();
  }

  async init(): Promise<void> {
    const response = await this.limiter.schedule(async () =>
      needle(
        'get',
        `${SHIPSTATION_DOMAIN}/accounts/listtags`,
        null,
        this.needleOptions,
      ),
    );
    if (response.statusCode === 200) {
      this.tagsList.clear();
      const { body } = response;
      for (const item of body) {
        const tagItem = item as ProductTag;
        this.tagsList.set(tagItem.name, tagItem);
      }
    } else {
      throw new Error(
        `Invalid response code: ${
          response.statusCode
        } with response: ${JSON.stringify(response.body)}`,
      );
    }
  }

  async createOrUpdateOrder(orderPayload: Order): Promise<TODO_ANY> {
    const response = await this.limiter.schedule(() =>
      needle(
        'post',
        `${SHIPSTATION_DOMAIN}/orders/createorder`,
        orderPayload,
        this.needleOptions,
      ),
    );
    if (response.statusCode === 200) {
      Logger.debug(
        `API limits: limit ${response.headers['x-rate-limit-limit']}, remaining: ${response.headers['x-rate-limit-remaining']}, reset: ${response.headers['x-rate-limit-reset']}`,
      );
      return response.body;
    } else {
      throw new Error(
        `Invalid response code: ${response.statusCode} for order: ${
          orderPayload.orderNumber
        } with response: ${JSON.stringify(response.body)}`,
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
        this.needleOptions,
      ),
    );
    if (response.statusCode === 200) {
      return response.body;
    } else {
      throw new Error(
        `Invalid response code: ${
          response.statusCode
        } with response: ${JSON.stringify(response.body)}`,
      );
    }
  }

  async getListOrders(params: ListOrdersQuery): Promise<Order[]> {
    const url = `${SHIPSTATION_DOMAIN}/orders`;
    let query = '';
    for (const [key, value] of Object.entries(params)) {
      query += `${key}=${value}`;
    }
    const full_url = `${url}${query ? `?${query}` : query}`;
    Logger.debug(full_url);
    const response = await this.limiter.schedule(() =>
      needle('get', full_url, null, this.needleOptions),
    );
    if (response.statusCode === 200) {
      const { body } = response;
      return body.orders as Order[];
    } else {
      throw new Error(
        `Invalid response code: ${
          response.statusCode
        } with response: ${JSON.stringify(response.body)}`,
      );
    }
  }

  async deleteOrder(orderId: string | number): Promise<boolean> {
    Logger.debug(`Deleting orderId: ${orderId}`);
    const full_url = `${SHIPSTATION_DOMAIN}/orders/${orderId}`;
    const response = await this.limiter.schedule(() =>
      needle('delete', full_url, null, this.needleOptions),
    );
    if (response.statusCode === 200 && response.body.success === true) {
      return true;
    }
    throw new Error(
      `Invalid response code: ${
        response.statusCode
      } with response: ${JSON.stringify(response.body)}`,
    );
  }
}
