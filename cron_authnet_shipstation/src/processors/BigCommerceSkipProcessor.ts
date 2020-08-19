import Processor, { ProcessorResult } from './Processor';
import { TODO_ANY } from '../Helper';
import { isBigCommerceTransaction } from './BigCommerceProcessor';

export default class BigCommerceSkipProcessor extends Processor {
  constructor() {
    super('BigCommerceSkipProcessor');
  }

  async process(transactionDetails: TODO_ANY[]): Promise<ProcessorResult> {
    this.logger.info(`Total transactions count: ${transactionDetails.length}`);
    const bigCommerceTransactions = transactionDetails.filter(
      isBigCommerceTransaction
    );
    this.logger.info(
      `BigCommerce total transactions count: ${bigCommerceTransactions.length}`
    );
    const bigCommerceSetOfTransactions = new Set(bigCommerceTransactions);
    const skipped = transactionDetails.filter(
      tr => !bigCommerceSetOfTransactions.has(tr)
    );
    return {
      skipped,
      orderTrans: [], // always empty, because we only skip such transactions (for now) and later such transactions
      // will be removed from the create table of db.
    };
  }
}
