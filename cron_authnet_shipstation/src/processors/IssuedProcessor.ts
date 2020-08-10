import Processor, { ProcessorResult } from './Processor';
import { TODO_ANY } from '../Helper';
import * as Helper from '../Helper';
import { moveIssuedTransaction } from '../db';

export class NotApprovedError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export default class IssuedProcessor extends Processor {
  constructor() {
    super('IssuedProcessor');
  }

  filterTheIssues(transactions: Helper.TODO_ANY): boolean {
    const arrOfTransactions = Array.isArray(transactions)
      ? transactions
      : [transactions];
    for (const transactionDetails of arrOfTransactions) {
      const state = transactionDetails?.responseReasonDescription?.toLowerCase();
      if (state !== 'approval') {
        const { transId } = transactionDetails;
        const message = `Transaction ${transId} has invalid state: ${state}`;
        this.logger.warn(message);
        const issue = new NotApprovedError(message);
        Promise.all(
          arrOfTransactions.map(tran => moveIssuedTransaction(tran, issue))
        ).catch(e => this.logger.error(e));
        return true;
      }
    }
    return false;
  }

  async process(transactionDetails: TODO_ANY[]): Promise<ProcessorResult> {
    this.logger.info(`Total transactions count: ${transactionDetails.length}`);
    const transactionsWithIssues = transactionDetails.filter(tr =>
      this.filterTheIssues(tr)
    );
    this.logger.info(
      `Transactions with issues (not approval): ${transactionsWithIssues.length}`
    );
    const skipped = transactionDetails.filter(tr => {
      return !transactionsWithIssues.includes(tr);
    });
    return Promise.resolve({
      skipped,
      orderTrans: [],
    });
  }
}
