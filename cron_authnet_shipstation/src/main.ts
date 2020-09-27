import { CronJob } from 'cron';
import anymatch from 'anymatch';
import * as env from 'env-var';
import moment from 'moment';
import config from './config';
import Bottleneck from 'bottleneck';
import Logger from './logger';
import AuthNetProxy from './AuthNetProxy';
import ShipStationProxy, { ProductTag } from './ShipStationProxy';
import * as Helper from './Helper';
import {
  convertRecordsIntoArrayOfTransactionsIds,
  getDbTransactionsCreated,
  getDbTransactionsProcessed,
  moveIssuedTransaction,
  moveProcessedTransaction,
  getAllGroups,
  removeDbTransactionsCreated,
} from './db';
import Processor, { OrderTransactionPair } from './processors/Processor';
import CommonProcessor from './processors/CommonProcessor';
import BigCommerceProcessor from './processors/BigCommerceProcessor';
import IssuedProcessor from './processors/IssuedProcessor';
import VoidedProcessor from './processors/VoidedProcessor';
import BigCommerceSkipProcessor from './processors/BigCommerceSkipProcessor';
import {
  BIGCOMMERCE_ACCESS_TOKEN,
  BIGCOMMERCE_CLIENT_ID,
  BIGCOMMERCE_STORE_HASH,
  AUTHNET_API_LOGIN_ID,
  AUTHNET_ENVIRONMENT,
  AUTHNET_TRANSACTION_KEY,
  SHIPSTATION_API_KEY,
  SHIPSTATION_API_SECRET,
  TIMEZONE,
} from './env-vars';
import { TaskCheckBGHook } from './TaskCheckBGHook';
import { AdvancedOptions } from './ShipStationTypes';

const LIMITER_OPTIONS: Bottleneck.ConstructorOptions = {
  maxConcurrent: 100,
  minTime: 10,
};

const limiter = new Bottleneck(LIMITER_OPTIONS);

const logger = Logger('src/main.ts');

export async function getBatchIdArray(
  authNetProxy: AuthNetProxy
): Promise<Helper.TODO_ANY> {
  const previousDayStart = moment().utc().subtract(1, 'day').startOf('day');
  const currentDayStart = moment().utc().startOf('day');
  const batchIds = await authNetProxy.getBatchIds(
    previousDayStart.toDate(),
    currentDayStart.toDate()
  );
  logger.info(`Fetched ${batchIds.length} batch ids.`);
  return batchIds;
}

export async function Delay(defaultTimeout = 1000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, defaultTimeout);
  });
}

export function createAuthNetProxy(): AuthNetProxy {
  return new AuthNetProxy(
    AUTHNET_API_LOGIN_ID,
    AUTHNET_TRANSACTION_KEY,
    AUTHNET_ENVIRONMENT
  );
}

export function createShipStationProxy(): ShipStationProxy {
  return new ShipStationProxy(SHIPSTATION_API_KEY, SHIPSTATION_API_SECRET);
}

export async function init(shipStationProxy: ShipStationProxy): Promise<void> {
  await Promise.all([Helper.init(), shipStationProxy.init()]);
}

export function createFetcherDetails(authNetProxy: AuthNetProxy) {
  async function getDetailsById(
    transactionId: string
  ): Promise<Helper.TODO_ANY> {
    const transactionDetails = await limiter.schedule(async () =>
      authNetProxy.getTransactionDetails(transactionId)
    );
    if (!transactionDetails.order.description) {
      const subscriptionData = await limiter.schedule(async () =>
        authNetProxy.getSubscription(transactionDetails.subscription.id)
      );
      transactionDetails.order.description = subscriptionData.name;
      transactionDetails.subscriptionData = subscriptionData;
    }
    await Helper.saveTransactionsDetailsJson(transactionDetails);
    return transactionDetails;
  }
  return getDetailsById;
}

export async function getAuthTransactionDetailsArray(
  batchIds: Array<Helper.TODO_ANY>,
  authNetProxy: AuthNetProxy
): Promise<Helper.TODO_ANY> {
  const transactionsDetailsArrOfArr: Array<Array<
    Helper.TODO_ANY
  >> = await Promise.all(
    batchIds.map(async batchId => {
      logger.info(`Processing batch #${batchId}`);
      const transactionsIds = await authNetProxy.getTransactionsIdList(batchId);
      logger.info(`Fetched ${transactionsIds.length} for batch id: ${batchId}`);
      return await Promise.all(
        transactionsIds.map(createFetcherDetails(authNetProxy))
      );
    })
  );
  const transactions = transactionsDetailsArrOfArr.flat();
  const ids = new Set();
  return transactions
    .filter(tr => {
      if (ids.has(tr.transId)) {
        return false;
      }
      ids.add(tr.transId);
      return true;
    })
    .sort((trA, trB) => trA.transId - trB.transId);
}

export type ServiceCore = {
  authNetProxy: AuthNetProxy;
  shipStationProxy: ShipStationProxy;
};

export async function CreateAndInitCore(): Promise<ServiceCore> {
  const authNetProxy = createAuthNetProxy();
  const shipStationProxy = createShipStationProxy();
  await init(shipStationProxy);
  return { authNetProxy, shipStationProxy };
}

/*const processor = async () => {
  const { shipStationProxy, authNetProxy } = await CreateAndInitCore();
  const batchIds = await getBatchIdArray(authNetProxy);
  const transactionDetails = await getAuthTransactionDetailsArray(
    batchIds,
    authNetProxy
  );
  logger.info(`Total transactions count: ${transactionDetails.length}`);
  const approvedTransactions = transactionDetails.filter(isApprovedTransaction);
  logger.info(`Approved transactions count: ${approvedTransactions.length}`);
  const combinedTransactions = combineTransactions<Helper.TODO_ANY>(
    approvedTransactions
  );
  logger.info(`Combined transactions count: ${combinedTransactions.length}`);
  await Promise.all(
    combinedTransactions.map(async transactionDetails => {
      let order;
      try {
        order = shipStationProxy.transformData(transactionDetails);
        logger.info(`Processing order: ${order.orderNumber}`);
        await Helper.saveOrderAsCSV(order);
        await Helper.saveOrderAsJson(order);
        const shipStationResponse = await shipStationProxy.createOrUpdateOrder(
          order
        );
        logger.info(`Order saved: ${order.orderNumber}`);
        return { order, shipStationResponse };
      } catch (e) {
        logger.error(e);
      }
    })
  );
};*/

// const authNetFlow = async () => {
//   try {
//     logger.info('Started');
//     await processor();
//   } catch (e) {
//     logger.error(e);
//   } finally {
//     logger.info('Finished');
//   }
// };

export function createBigCommerceProcessor(
  tagsList: Map<string, ProductTag>
): BigCommerceProcessor {
  return new BigCommerceProcessor(
    BIGCOMMERCE_STORE_HASH,
    BIGCOMMERCE_CLIENT_ID,
    BIGCOMMERCE_ACCESS_TOKEN,
    tagsList
  );
}

export function createProcessors(
  shipStationProxy: ShipStationProxy
): Processor[] {
  return [
    new IssuedProcessor(),
    new VoidedProcessor(),
    new BigCommerceSkipProcessor(),
    // createBigCommerceProcessor(shipStationProxy.tagsList),
    new CommonProcessor(shipStationProxy.tagsList),
  ];
}

async function postProcessOrders(
  orderDataPairs: OrderTransactionPair[]
): Promise<OrderTransactionPair[]> {
  const groups = await getAllGroups();
  return orderDataPairs.map(pair => {
    const { order } = pair;
    if (!order.items || order.items.length === 0) {
      return pair;
    }
    for (const group of groups) {
      if (
        anymatch(
          group.productNameGlob,
          order.items.map(item => item.name)
        ) &&
        anymatch(
          group.productSkuGlob,
          order.items.map(item => item.sku)
        )
      ) {
        if (!order.advancedOptions) {
          order.advancedOptions = {} as AdvancedOptions;
        }
        let value = group.customName ? group.customName : group.name;
        order.items.find(item => {
          return item.options?.find(option => {
            const flag = option.name === 'color' || option.name === 'Color';
            if (flag) {
              value += ` - ${option.value}`;
            }
            return flag;
          });
        });
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
      }
    }
    return pair;
  });
}

export async function orderPairProcessor(
  pair: OrderTransactionPair,
  shipStationProxy: ShipStationProxy
): Promise<void> {
  const { order, transaction } = pair;
  try {
    const jsonTransaction = JSON.stringify(transaction);
    logger.info(
      `Processing order: ${order.orderNumber} (transaction: ${jsonTransaction})`
    );
    await Helper.SaveOrder(order);
    const shipStationResponse = await shipStationProxy.createOrUpdateOrder(
      order
    );
    logger.info(
      `Order saved: ${order.orderNumber} (transaction: ${jsonTransaction})`
    );
    await moveProcessedTransaction(transaction, shipStationResponse);
  } catch (e) {
    await moveIssuedTransaction(transaction, e);
    logger.error(e);
  } finally {
    await Delay();
  }
}

export async function dbProcessor(): Promise<void> {
  const { shipStationProxy, authNetProxy } = await CreateAndInitCore();
  const records = await getDbTransactionsCreated();
  const ids = convertRecordsIntoArrayOfTransactionsIds(records);
  let transactionDetails = await Promise.all(
    ids.map(createFetcherDetails(authNetProxy))
  );
  const orderTransTotal: OrderTransactionPair[] = [];
  const processors: Processor[] = createProcessors(shipStationProxy);
  for (const processor of processors) {
    const { orderTrans, skipped } = await processor.process(transactionDetails);
    transactionDetails = skipped;
    orderTransTotal.push(...orderTrans);
  }
  const processedOrdersPair = await postProcessOrders(orderTransTotal);
  for (const pair of processedOrdersPair) {
    await orderPairProcessor(pair, shipStationProxy);
  }
}

const checkDuplicates = async () => {
  const [transactionsCreatedId, transactionsProcessedId] = await Promise.all([
    getDbTransactionsCreated(),
    getDbTransactionsProcessed(),
  ]);
  const setTransactionsProcessedId = new Set();
  transactionsProcessedId.forEach(tr =>
    setTransactionsProcessedId.add(tr.transactionId)
  );
  const duplicatesTransactionsCreatedId = transactionsCreatedId.filter(tr =>
    setTransactionsProcessedId.has(tr.transactionId)
  );
  await removeDbTransactionsCreated(duplicatesTransactionsCreatedId);
};

const dbFlow = async () => {
  try {
    logger.info('Started');
    await checkDuplicates();
    await dbProcessor();
  } catch (e) {
    logger.error(e);
  } finally {
    logger.info('Finished');
    logger.info(`Next invoke: ${job.nextDate().toISOString()}`);
  }
};

const schedule = env
  .get('CRON_SCHEDULE')
  .default(config.Cron.Schedule)
  .asString();

const runOnInit = require.main === module;
/**
 * timezone - https://momentjs.com/timezone/
 */
const job = new CronJob(
  schedule,
  dbFlow,
  null,
  false,
  TIMEZONE,
  null,
  runOnInit
);
const jobs = [job, TaskCheckBGHook];
if (require.main === module) {
  jobs.forEach(j => j.start());
}
