import Processor, { ProcessorResult } from './Processor';
import { TODO_ANY } from '../Helper';
import { moveIssuedTransaction } from '../db';

export function isVoidedTransaction(transaction: TODO_ANY): boolean {
  return transaction.transactionStatus?.toLowerCase() === 'voided';
}

export class VoidedError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export default class VoidedProcessor extends Processor {
  constructor() {
    super('VoidedProcessor');
  }

  async process(transactionDetails: TODO_ANY[]): Promise<ProcessorResult> {
    this.logger.info(`Total transactions count: ${transactionDetails.length}`);
    const voidedTransactions = transactionDetails.filter(isVoidedTransaction);
    this.logger.info(`Voided transactions count: ${voidedTransactions.length}`);
    const processed = new Set<TODO_ANY>();
    await Promise.all(
      voidedTransactions.map(
        async (transaction: TODO_ANY): Promise<void> => {
          try {
            const issue = new VoidedError(
              `Transaction: ${transaction.transId} is voided.`
            );
            await moveIssuedTransaction(transaction, issue);
            processed.add(transaction);
          } catch (e) {
            this.logger.error(e);
          }
        }
      )
    );
    const result: ProcessorResult = {
      orderTrans: [], // ALWAYS empty, because this processor don't create Orders, it just moved invalid
      skipped: transactionDetails.filter(tr => !processed.has(tr)),
    };
    return Promise.resolve(result);
  }
}
