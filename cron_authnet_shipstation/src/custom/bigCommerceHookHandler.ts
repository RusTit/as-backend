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
const hookId = 20761619;

const categories = async () => {
  const allCategories = await proxy.getAllCategories();
  debugger;
};

const main = async () => {
  await categories();
  const webHooks = await proxy.getAllHooks();
  if (webHooks.length === 0) {
    const result = await proxy.createHook({
      destination: hookPath,
      headers: {},
      is_active: true,
      scope: 'store/order/statusUpdated',
    });
    console.log(result);
  } else {
    const hook = webHooks.find(hook => hook.id === hookId);
    if (hook && !hook.is_active) {
      hook.is_active = true;
      const result = await proxy.updateHookById(hookId, hook);
      console.log(result);
    }
  }
};

main().catch(e => console.error(e));
