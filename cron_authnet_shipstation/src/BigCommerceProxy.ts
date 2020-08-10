import Bottleneck from 'bottleneck';
import { Logger } from 'log4js';
import LoggerFactory from './logger';
import needle, { NeedleHttpVerbs, NeedleOptions } from 'needle';
import { TODO_ANY } from './Helper';
import { Address } from './ShipStationTypes';

/*
https://developer.bigcommerce.com/api-docs/getting-started/best-practices#api-rate-limits
Plus & Standard plans: 20k per hour (150 / 30sec)
 */
const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  reservoir: 150, // initial value 150
  reservoirRefreshAmount: 150,
  reservoirRefreshInterval: 30 * 1000, // must be divisible by 250, 30

  minTime: 10, // pick a value that makes sense for your use case
  maxConcurrent: 3, // 3
};

const BASE_URL = 'https://api.bigcommerce.com';

const NET_TIMEOUT = 30000;

export default class BigCommerceProxy {
  private readonly limiter: Bottleneck;
  private readonly logger: Logger;
  private readonly needleOptions: NeedleOptions;
  private readonly store_hash: string;

  constructor(store_hash: string, client_id: string, access_token: string) {
    this.limiter = new Bottleneck(LIMITER_OPTIONS);
    this.logger = LoggerFactory('src/BigCommerceProxy.ts');
    this.store_hash = store_hash;
    this.needleOptions = {
      headers: {
        'X-Auth-Client': client_id,
        'X-Auth-Token': access_token,
      },
      json: true,
      read_timeout: NET_TIMEOUT,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      response_timeout: NET_TIMEOUT,
    };
  }

  async makeRawRequest(
    url: string,
    method: NeedleHttpVerbs = 'get'
  ): Promise<TODO_ANY> {
    const response = await this.limiter.schedule(() =>
      needle(method, url, null, this.needleOptions)
    );
    if (response.statusCode === 200) {
      return response.body;
    } else {
      throw new Error(
        `Invalid response code: ${
          response.statusCode
        } (${url}) with response: ${JSON.stringify(response.body)}`
      );
    }
  }

  async getShippingAddress(
    orderBigCommerce: TODO_ANY
  ): Promise<Address | undefined> {
    const { url } = orderBigCommerce.shipping_addresses;
    const response = await this.limiter.schedule(() =>
      needle('get', url, null, this.needleOptions)
    );
    if (response.statusCode === 200) {
      return response.body;
    } else if (response.statusCode === 204) {
      // https://support.bigcommerce.com/s/article/Shipping-Real-Time-Quotes-Video
      /*
      Not issue, just shipment is not started, so no shipping can be get.
       */
      return;
    }
    throw new Error(
      `Invalid response code: ${
        response.statusCode
      } (${url}) with response: ${JSON.stringify(response.body)}`
    );
  }

  async getOrder(id: string): Promise<TODO_ANY> {
    return this.makeRawRequest(
      `${BASE_URL}/stores/${this.store_hash}/v2/orders/${id}`
    );
  }
}
