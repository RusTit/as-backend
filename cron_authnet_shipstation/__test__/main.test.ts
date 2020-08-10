import fs from 'fs/promises';
import path from 'path';
import {
  createAuthNetProxy, createBigCommerceProcessor, createFetcherDetails,
  createShipStationProxy,
  getAuthTransactionDetailsArray,
  getBatchIdArray,
  init,
} from '../src/main';
import { isApprovedTransaction} from '../src/filters'
import { TODO_ANY, } from '../src/Helper';

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
    const ids = ['62466142313'];
    const authNetProxy = createAuthNetProxy();
    const transactionsDetails = await Promise.all(ids.map(createFetcherDetails(authNetProxy)));
    const bigCommerceProcessor = createBigCommerceProcessor();
    const orders = await bigCommerceProcessor.process(transactionsDetails);
    expect(orders.orderTrans.length).toBeGreaterThan(0);
  });
});
