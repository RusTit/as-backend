import fs from 'fs/promises';
import path from 'path';
import stringify from 'csv-stringify';
import { Order } from './ShipStationTypes';
import flatten from 'flat';
import * as env from 'env-var';
import dotenvProxy from './dotenvProxy';
dotenvProxy();

const SAVE_OUTPUT_IN_FILES: boolean = env
  .get('SAVE_OUTPUT_IN_FILES')
  .default('false')
  .asBool();

const OUTPUT_DIRECTORY = path.resolve(__dirname, '..', 'output');

export type TODO_ANY = any;

export async function init(): Promise<void> {
  if (!SAVE_OUTPUT_IN_FILES) {
    return;
  }
  await fs.mkdir(OUTPUT_DIRECTORY, { recursive: true });
}

export async function saveTransactionsDetailsJson(
  transactionDetails: TODO_ANY
): Promise<void> {
  if (!SAVE_OUTPUT_IN_FILES) {
    return;
  }
  await fs.writeFile(
    path.join(
      OUTPUT_DIRECTORY,
      `transaction-${transactionDetails.transId}.json`
    ),
    JSON.stringify(transactionDetails, null, '\t')
  );
}

export async function saveOrderAsJson(order: Order): Promise<void> {
  if (!SAVE_OUTPUT_IN_FILES) {
    return;
  }
  await fs.writeFile(
    path.join(OUTPUT_DIRECTORY, `order-${order.orderNumber}.json`),
    JSON.stringify(order, null, '\t')
  );
}

export async function saveOrderAsCSV(order: Order): Promise<void> {
  if (!SAVE_OUTPUT_IN_FILES) {
    return;
  }
  const flat = flatten(order);
  return new Promise((resolve, reject) => {
    stringify([flat], { header: true }, (err, output) => {
      if (err) {
        reject(err);
      } else {
        resolve(output);
      }
    });
  }).then(async output => {
    const data = output as string;
    await fs.writeFile(
      path.join(OUTPUT_DIRECTORY, `order-${order.orderNumber}.csv`),
      data
    );
  });
}

export async function SaveOrder(order: Order): Promise<void> {
  await saveOrderAsCSV(order);
  await saveOrderAsJson(order);
}
