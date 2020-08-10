import * as Helper from './Helper';
import Logger from './logger';

const logger = Logger('src/filters.ts');

export function isApprovedTransaction(transactions: Helper.TODO_ANY): boolean {
  const transactionArr = Array.isArray(transactions)
    ? transactions
    : [transactions];
  let flag = true;
  for (const transaction of transactionArr) {
    const state = transaction?.transactionStatus?.toLowerCase();
    flag = state === 'settledsuccessfully';
    if (!flag) {
      const { transId } = transaction;
      logger.debug(`Skipping: ${transId} with state ${state}`);
      break;
    }
  }
  return flag;
}
