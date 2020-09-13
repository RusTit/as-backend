import fs from 'fs/promises';
import path from 'path';
import {
  createAuthNetProxy,
  createBigCommerceProcessor,
  createFetcherDetails,
  createProcessors,
  createShipStationProxy,
  getAuthTransactionDetailsArray,
  getBatchIdArray,
  init,
} from '../src/main';
import { isApprovedTransaction } from '../src/filters';
import { TODO_ANY } from '../src/Helper';
import CommonProcessor from '../src/processors/CommonProcessor';
import Processor, { OrderTransactionPair } from '../src/processors/Processor';

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
    /*    const shipStationProxy = createShipStationProxy();
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
    transactions = transactions.filter(isApprovedTransaction);*/
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
    const ids = ['42178860037', '42178860070'];
    const authNetProxy = createAuthNetProxy();
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    const transactionsDetails = await Promise.all(
      ids.map(createFetcherDetails(authNetProxy))
    );
    const processor = new CommonProcessor(shipStationProxy.tagsList);
    const oneOrderArr = await processor.process(transactionsDetails);
    expect(oneOrderArr.orderTrans.length).toBe(1);
    transactionsDetails[0].transactionStatus = 'myStatus';
    const zeroOrderArr = await processor.process(transactionsDetails);
    expect(zeroOrderArr.orderTrans.length).toBe(0);
  });
  it('test combined all processors', async () => {
    const ids = ['62530311856'];
    // const ids = ['42178860037', '42178860070'];
    const authNetProxy = createAuthNetProxy();
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    let transactionDetails = await Promise.all(
      ids.map(createFetcherDetails(authNetProxy))
    );
    // transactionDetails[0].transactionStatus = 'myStatus';
    const orderTransTotal: OrderTransactionPair[] = [];
    const processors: Processor[] = createProcessors(shipStationProxy);
    for (const processor of processors) {
      const { orderTrans, skipped } = await processor.process(
        transactionDetails
      );
      transactionDetails = skipped;
      orderTransTotal.push(...orderTrans);
    }
    expect(orderTransTotal.length).toBe(1);
  });
  it('test product not found on all processors', async () => {
    const ids = [
      '62545980127',
      '42216840795'
    ];
    const authNetProxy = createAuthNetProxy();
    const shipStationProxy = createShipStationProxy();
    await init(shipStationProxy);
    let transactionDetails = await Promise.all(
      ids.map(createFetcherDetails(authNetProxy))
    );
    // transactionDetails[0].transactionStatus = 'myStatus';
    const orderTransTotal: OrderTransactionPair[] = [];
    const processors: Processor[] = createProcessors(shipStationProxy);
    for (const processor of processors) {
      const { orderTrans, skipped } = await processor.process(
        transactionDetails
      );
      transactionDetails = skipped;
      orderTransTotal.push(...orderTrans);
    }
    expect(orderTransTotal.length).toBe(1);
  });
});
