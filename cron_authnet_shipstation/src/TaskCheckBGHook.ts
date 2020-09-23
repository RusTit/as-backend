import { CronJob } from 'cron';
import BigCommerceProxy from './BigCommerceProxy';
import {
  BIGCOMMERCE_STORE_HASH,
  BIGCOMMERCE_CLIENT_ID,
  BIGCOMMERCE_ACCESS_TOKEN,
  TIMEZONE,
} from './env-vars';
import { saveSystemEventEvent } from './db';
import Logger from './logger';
const logger = Logger('src/TaskCheckBGHook.ts');

const proxy = new BigCommerceProxy(
  BIGCOMMERCE_STORE_HASH,
  BIGCOMMERCE_CLIENT_ID,
  BIGCOMMERCE_ACCESS_TOKEN
);

const logCommon = async (message: string): Promise<void> => {
  logger.info(message);
  await saveSystemEventEvent(message);
};

const run = async () => {
  try {
    logger.info(`Started.`);
    logger.info(`Getting all hooks`);
    const webHooks = await proxy.getAllHooks();
    if (webHooks.length) {
      const hookId = 20761619;
      const hook = webHooks.find(hook => hook.id === hookId);
      if (!hook) {
        await logCommon(`Hook ${hookId} wasn't found. Abort`);
      } else if (!hook.is_active) {
        await logCommon(`Hook is disabled. Enabling it.`);
        hook.is_active = true;
        const result = await proxy.updateHookById(hookId, hook);
        logger.debug(result);
        await logCommon(`Hook is enabled successfully`);
      } else {
        await logCommon(`Hook is found and enabled. State is ok`);
      }
    } else {
      logger.info(`No hooks in BG. Cannot auto restore state.`);
    }
    logger.info('Finished');
  } catch (e) {
    logger.error(`Unexpected error`);
    logger.error(e);
    await saveSystemEventEvent(`Unexpected event: ${e.message}`);
  }
};

const runOnInit = require.main === module;

export const TaskCheckBGHook: CronJob = new CronJob(
  '0 10 * * * *',
  run,
  null,
  false,
  TIMEZONE,
  null,
  runOnInit
);
