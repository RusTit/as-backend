import fs from 'fs/promises';
import path from 'path';
import {
  createAuthNetProxy,
  createBigCommerceProcessor,
  createFetcherDetails,
  createShipStationProxy,
  getAuthTransactionDetailsArray,
  getBatchIdArray,
  init,
} from '../src/main';
import { isApprovedTransaction } from '../src/filters';
import { TODO_ANY } from '../src/Helper';
import ShipStationProxy from '../src/ShipStationProxy';
import CommonProcessor from '../src/processors/CommonProcessor';

const OUTPUT_DIRECTORY = path.resolve(__dirname, '..', 'output');
/**
 * Two minutes for jest test case.
 */
const LONG_ASYNC_DELAY = 120000;

async function LoadTransactionsFromOutputFolder(): Promise<Array<TODO_ANY>> {
  try {
    await fs.access(OUTPUT_DIRECTORY);
    const files = await fs.readdir(OUTPUT_DIRECTORY);
    const transactionFiles = files.filter(file =>
      file.includes('transaction-')
    );
    return await Promise.all(
      transactionFiles.map(async file => {
        const fullPath = path.join(OUTPUT_DIRECTORY, file);
        const content = await fs.readFile(fullPath, { encoding: 'utf8' });
        return JSON.parse(content);
      })
    );
  } catch (e) {
    console.warn(`Output directory doesn't exist.`);
  }
  return [];
}

describe('main tests', () => {
  let transactions: Array<TODO_ANY>;
  beforeAll(async () => {
    jest.setTimeout(LONG_ASYNC_DELAY);
    return;
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    transactions = await LoadTransactionsFromOutputFolder();
    if (transactions.length === 0) {
      const authNetProxy = createAuthNetProxy();
      const batchIds = await getBatchIdArray(authNetProxy);
      transactions = await getAuthTransactionDetailsArray(
        batchIds,
        authNetProxy
      );
    }
    transactions = transactions.filter(isApprovedTransaction);
  });
  beforeEach(() => {
    jest.setTimeout(LONG_ASYNC_DELAY);
  });
  it('check that we can get initial transactions', async () => {
    expect(transactions.length).toBeGreaterThan(0);
  });
  it('test bigcommerce processor', async () => {
    const ids = ['62498274422'];
    const authNetProxy = createAuthNetProxy();
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    const transactionsDetails = await Promise.all(
      ids.map(createFetcherDetails(authNetProxy))
    );
    const bigCommerceProcessor = createBigCommerceProcessor(
      shipStationProxy.tagsList
    );
    const orders = await bigCommerceProcessor.process(transactionsDetails);
    expect(orders.orderTrans.length).toBeGreaterThan(0);
  });
  it('test common processor', async () => {
    const ids = ['42162684664'];
    const authNetProxy = createAuthNetProxy();
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    const transactionsDetails = await Promise.all(
      ids.map(createFetcherDetails(authNetProxy))
    );
    const processor = new CommonProcessor(shipStationProxy.tagsList);
    const orders = await processor.process(transactionsDetails);
    expect(orders.orderTrans.length).toBeGreaterThan(0);
  });
  it('test common combined processor', async () => {
    const ids = ['62502465548', '62502466092'];
    const authNetProxy = createAuthNetProxy();
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    const transactionsDetails = await Promise.all(
      ids.map(createFetcherDetails(authNetProxy))
    );
    const processor = new CommonProcessor(shipStationProxy.tagsList);
    const orders = await processor.process(transactionsDetails);
    expect(orders.orderTrans.length).toBeGreaterThan(0);
  });
});
