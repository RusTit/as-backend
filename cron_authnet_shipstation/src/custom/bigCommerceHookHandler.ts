import BigCommerceProxy from '../BigCommerceProxy';
import {
  BIGCOMMERCE_STORE_HASH,
  BIGCOMMERCE_CLIENT_ID,
  BIGCOMMERCE_ACCESS_TOKEN,
} from '../env-vars';

const proxy = new BigCommerceProxy(
  BIGCOMMERCE_STORE_HASH,
  BIGCOMMERCE_CLIENT_ID,
  BIGCOMMERCE_ACCESS_TOKEN
);

const hookPath = 'https://tacticaltrapsshipping.com/bigcomhook';

const main = async () => {
  const webHooks = await proxy.getAllHooks();
  if (webHooks.length === 0) {
    const result = await proxy.createHook({
      destination: hookPath,
      headers: {},
      is_active: true,
      scope: 'store/order/statusUpdated',
    });
    console.log(result);
  }
  debugger;
};

main().catch(e => console.error(e));
