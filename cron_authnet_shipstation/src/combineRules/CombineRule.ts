import { Logger } from 'log4js';
import LoggerFactory from '../logger';
import CommonProcessor from '../processors/CommonProcessor';
import { TODO_ANY } from '../Helper';

export default abstract class CombineRule {
  protected readonly logger: Logger;
  protected DESCRIPTION_TO_MATCH?: string[];

  protected constructor(logCategory: string) {
    this.logger = LoggerFactory(logCategory);
  }

  private matchToDescription(description: string): boolean {
    if (!this.DESCRIPTION_TO_MATCH) {
      throw new Error('Descriptions array is not set in the child');
    }
    for (const desc_match of this.DESCRIPTION_TO_MATCH) {
      // if (description.includes(desc_match)) {
      if (description.startsWith(desc_match)) {
        return true;
      }
    }
    return false;
  }

  abstract isAcceptable(transaction: TODO_ANY): boolean;
  process(
    transactions: Array<TODO_ANY | Array<TODO_ANY>>,
    position: number
  ): Array<TODO_ANY | Array<TODO_ANY>> {
    const leftArr = transactions.slice(0, position);
    const firstTransaction = transactions[position];
    const color = CommonProcessor.getColorFromTheDescription(
      firstTransaction.order.description
    );
    const email = firstTransaction.customer?.email;
    const combinedTransactions = [firstTransaction];
    let isFound = false;
    const rightArr = [];
    for (let i = position + 1; i < transactions.length; ++i) {
      const transaction = transactions[i];
      if (Array.isArray(transaction)) {
        rightArr.push(transaction);
        continue;
      }
      const description: string | undefined = transaction.order.description;
      let isAdded = false;
      if (
        typeof description === 'string' &&
        this.matchToDescription(description)
      ) {
        const iterColor = CommonProcessor.getColorFromTheDescription(
          transaction.order.description
        );
        const iterEmail = transaction.customer?.email;
        if (color === iterColor && email === iterEmail) {
          const message = `Found pair: ${transaction.transId} and ${firstTransaction.transId}. color: ${color}, email: ${email}`;
          this.logger.debug(message);
          isAdded = true;
          if (isFound) {
            this.logger.warn('Found duplicate color and email.');
          } else {
            isFound = true;
            combinedTransactions.push(transaction);
          }
        }
      }
      if (!isAdded) {
        rightArr.push(transaction);
      }
    }
    const result =
      combinedTransactions.length === 1
        ? [...leftArr, firstTransaction, ...rightArr]
        : [...leftArr, combinedTransactions, ...rightArr];
    return result;
  }
}
