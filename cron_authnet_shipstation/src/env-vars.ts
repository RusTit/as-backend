import * as env from 'env-var';
import dotenvProxy from './dotenvProxy';
import config from './config';

dotenvProxy();

export const AUTHNET_API_LOGIN_ID: string = env
  .get('AUTHNET_API_LOGIN_ID')
  .required()
  .asString();
export const AUTHNET_TRANSACTION_KEY: string = env
  .get('AUTHNET_TRANSACTION_KEY')
  .required()
  .asString();
export const AUTHNET_ENVIRONMENT: string = env
  .get('AUTHNET_ENVIRONMENT')
  .default('prod')
  .asString();
export const SHIPSTATION_API_KEY: string = env
  .get('SHIPSTATION_API_KEY')
  .required()
  .asString();
export const SHIPSTATION_API_SECRET: string = env
  .get('SHIPSTATION_API_SECRET')
  .required()
  .asString();
export const BIGCOMMERCE_ACCESS_TOKEN: string = env
  .get('BIGCOMMERCE_ACCESS_TOKEN')
  .required()
  .asString();
export const BIGCOMMERCE_CLIENT_ID: string = env
  .get('BIGCOMMERCE_CLIENT_ID')
  .required()
  .asString();
export const BIGCOMMERCE_STORE_HASH: string = env
  .get('BIGCOMMERCE_STORE_HASH')
  .required()
  .asString();
export const TIMEZONE = env
  .get('CRON_TIMEZONE')
  .default(config.Cron.Timezone)
  .asString();
