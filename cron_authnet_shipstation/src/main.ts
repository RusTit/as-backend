import { CronJob } from 'cron';
import anymatch, { Matcher } from 'anymatch';
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
  moveIssuedTransaction,
  moveProcessedTransaction,
  getAllGroups,
  removeDuplicates,
} from './db';
import Processor, { OrderTransactionPair } from './processors/Processor';
import CommonProcessor, {
  convertColorName,
} from './processors/CommonProcessor';
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
import { GroupEntity } from './entities/Group.entity';
import { Order } from './ShipStationTypes';

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
  const transactionsDetailsArrOfArr: Array<
    Array<Helper.TODO_ANY>
  > = await Promise.all(
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

export function getSizeFromName(value: string, group?: GroupEntity): string {
  if (group?.name === 'Mantle') {
    return '';
  }
  return value.split(' ')[0];
}

const lockTypes = new Map<string, string>();

lockTypes.set('BT', 'BT');
lockTypes.set('BIO', 'BIO');

lockTypes.set('1791 Flag Big', 'BIO');
lockTypes.set('1791 Flag', 'BT'); // 62679901961

lockTypes.set('RFID', 'RFID');
lockTypes.set('The 4 Laws Flag Wall Art', '');
lockTypes.set('TT Arcticstorm', '');
lockTypes.set('Recon Tactical Smart Watch', '');
lockTypes.set('Master Card', '');

lockTypes.set('Rustic Racks', 'BT');

lockTypes.set('Liberty Rustic Pistol', 'BT');
lockTypes.set('Liberty 35S', 'BT'); // 36944

lockTypes.set('TT Defender', 'BT'); // 194646
lockTypes.set('Defender Rustic Rifle', 'BT');
lockTypes.set('The Defender 45R', 'BT'); // 36930

lockTypes.set('36C Contemporary Pistol', 'BT');
lockTypes.set('The 36C Shelf', 'BT');

lockTypes.set('47C Contemporary Rifle', 'BT');
lockTypes.set('The 47C Shelf', 'BT');

lockTypes.set('Guardian Tactical Frame', 'BT'); // 36934
lockTypes.set('Guardian Frames', 'BT');
lockTypes.set('Guardian Frame', 'BT'); // 194734, 194729

lockTypes.set('Tactical End Table', 'BT');

lockTypes.set('1791 Whiskey Barrel Flag MAX', 'BIO'); // 36940
lockTypes.set('1791 Whiskey Barrel Flag', 'BT'); // 36940
lockTypes.set('1791 Whiskey Flag', 'BT');
lockTypes.set('Flag 1791', 'BT'); // 194730

lockTypes.set('The Tactical Barrel', 'BT');
lockTypes.set('Barrel Head', 'BT');
lockTypes.set('Barrel Heads', 'BT');

lockTypes.set('MAX flags', 'BIO');

lockTypes.set('Mantles', 'BIO');
lockTypes.set('Mantle', 'BIO'); // 37079

lockTypes.set('Table', 'BT'); // 37081;
lockTypes.set('Endtable', 'BT');

lockTypes.set('Freedom Rifle', 'RFID');
lockTypes.set('Rack', 'BT');

export function getLockTypeFromName(name: string): string {
  for (const [key, value] of lockTypes) {
    if (name.includes(key)) {
      return value;
    }
  }
  return 'RFID';
}

const specificColors = new Map<string, string>();
specificColors.set('"Old Glory" Red & Blue Rustic Flag', 'Traditional');
specificColors.set('"Old Glory" Torched Rustic Flag', 'Torched');
specificColors.set('TT Flag 1791', '1791');
specificColors.set(
  '1791 Flag (Premium Edition Includes: RFID lock Bluetooth, Foam, LED light)',
  '1791'
);
specificColors.set('1791 Flag Big', '1791 MAX');
specificColors.set('The 1791 Whiskey Barrel Flag - Special Edition', '1791');
specificColors.set('1791 Whiskey Barrel Flag MAX', '1791 MAX');
specificColors.set('Gunstock and Steel Flag', 'Gunstock');
specificColors.set('Tactical Flag Barnwood Edition', 'Barnwood');
specificColors.set('"Thin Blue Line" Rustic Flag', 'Blue Line');
specificColors.set('"Thin Red Line" Rustic Flag', 'Red Line');
specificColors.set('The Betsy Ross Rustic Tactical Flag', 'Betsy Ross');
specificColors.set('The Betsy Ross Rustic Tactical  Flag', 'Betsy Ross');
specificColors.set('The 4 Laws Tactical Flag', '4 Laws');
specificColors.set('The Tactical Flag "Moonshine" Edition', 'Moonshine');
specificColors.set(
  'Elite Military Special Edition Tactical Flag',
  'Elite Military'
);
specificColors.set('The Rustic Rosegold Tactical Flag', 'Rosegold');

export function getColorFromName(name: string): string {
  for (const [key, value] of specificColors) {
    if (name.includes(key)) {
      return value;
    }
  }
  return '';
}

export function internalNoteColorUndefined(
  order: Order,
  group: GroupEntity,
  color?: string
): Order {
  switch (group.name) {
    case 'Pistol':
    case 'Compact':
    case 'Defender':
    case 'Frame':
    case 'Liberty':
    case 'Rifles':
      if (!color || color.toLowerCase() === 'undefined') {
        order.internalNotes = 'Color Undefined';
      }
      break;
    default:
  }
  return order;
}

export async function getSortedGroups(): Promise<GroupEntity[]> {
  const groups = await getAllGroups();
  return groups.sort(
    (a, b) =>
      b.productNameGlob.length +
      b.productSkuGlob.length -
      (a.productNameGlob.length + a.productSkuGlob.length)
  );
}

export async function postProcessOrders(
  orderDataPairs: OrderTransactionPair[]
): Promise<OrderTransactionPair[]> {
  const sortedGroups = await getSortedGroups();
  return orderDataPairs.map(pair => {
    const { order } = pair;
    if (!order.items || order.items.length === 0) {
      return pair;
    }
    if (
      order.advancedOptions &&
      (order.advancedOptions.customField1 ||
        order.advancedOptions.customField2 ||
        order.advancedOptions.customField3)
    ) {
      return pair;
    }
    for (const group of sortedGroups) {
      const { productNameGlob, productSkuGlob } = group;
      let productNameMatcher: Matcher = productNameGlob;
      if (!productNameGlob.includes('*')) {
        productNameMatcher = (val: string): boolean =>
          val.includes(productNameGlob);
      }
      let productSkuMatcher: Matcher = productSkuGlob;
      if (!productSkuGlob.includes('*')) {
        productSkuMatcher = (val: string): boolean =>
          val.includes(productSkuGlob);
      }
      if (
        anymatch(
          productNameMatcher,
          order.items.map(item => item.name)
        ) &&
        anymatch(
          productSkuMatcher,
          order.items.map(item => item.sku)
        )
      ) {
        if (!order.advancedOptions) {
          order.advancedOptions = {} as AdvancedOptions;
        }
        const name = group.customName ? group.customName : group.name;
        const [firstItem] = order.items; // assuming to process only FIRST item
        const colorOption = firstItem.options?.find(
          option => option.name === 'color' || option.name === 'Color'
        );
        let color = colorOption ? convertColorName(colorOption.value) : '';
        if (!color) {
          color = getColorFromName(firstItem.name as string);
        }
        internalNoteColorUndefined(order, group, color);
        const sizeOption = firstItem.options?.find(
          option => option.name === 'size' || option.name === 'Size'
        );
        const size = sizeOption ? getSizeFromName(sizeOption.value, group) : '';

        let lockType: string;
        switch (group.name) {
          case 'Pistol':
          case 'Compact':
            if (firstItem.name?.includes('Elite Fingerprint')) {
              lockType = 'BIO';
            } else if (firstItem.name?.includes('Elite')) {
              lockType = 'BT';
            } else {
              lockType = getLockTypeFromName(firstItem.name as string);
            }
            break;
          default:
            lockType = getLockTypeFromName(firstItem.name as string);
        }
        const value = [name, `${size} ${color}`.trim(), lockType.trim()]
          .filter(s => s)
          .join(' - ');
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
        break;
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
  const uniqueRecords = await removeDuplicates(records);
  const ids = convertRecordsIntoArrayOfTransactionsIds(uniqueRecords);
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
  let index = 0;
  for (const pair of processedOrdersPair) {
    ++index;
    logger.debug(`Processing: ${index}/${processedOrdersPair.length}`);
    await orderPairProcessor(pair, shipStationProxy);
  }
}

let isRunning = false;

const dbFlow = async () => {
  if (isRunning) {
    logger.info('Cron job is running, so no need to run another instance');
    return;
  }
  try {
    isRunning = true;
    logger.info('Started');
    await dbProcessor();
  } catch (e) {
    logger.error(e);
  } finally {
    isRunning = false;
    logger.info('Finished');
    logger.info(`Next invoke: ${job.nextDate().toISOString()}`);
  }
};

const schedule = env
  .get('CRON_SCHEDULE')
  .default(config.Cron.Schedule)
  .asString();

const runOnInit = require.main === module;
// const runOnInit = false;
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
