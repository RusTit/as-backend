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

  compareTransactionInvoices(
    transactionA: TODO_ANY,
    transactionB: TODO_ANY
  ): number | null {
    const invoiceA = transactionA.order?.invoiceNumber;
    const invoiceB = transactionB.order?.invoiceNumber;
    if (!invoiceA || !invoiceB) {
      return null;
    }
    const invoiceValueA = Number.parseInt(invoiceA, 10);
    const invoiceValueB = Number.parseInt(invoiceB, 10);
    if (!Number.isFinite(invoiceValueA) || !Number.isFinite(invoiceValueB)) {
      return null;
    }
    return Math.abs(invoiceValueA - invoiceValueB);
  }

  private matchToDescription(description?: string): boolean {
    if (!description) {
      return false;
    }
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
    const rightArr = [];
    let possibleTransactionMatch: TODO_ANY | null = null;
    let diffForMatch: number | null = null;
    for (let i = position + 1; i < transactions.length; ++i) {
      const transaction = transactions[i];
      rightArr.push(transaction);
      if (Array.isArray(transaction)) {
        continue;
      }
      const description: string | undefined = transaction.order.description;
      if (this.matchToDescription(description)) {
        const iterColor = CommonProcessor.getColorFromTheDescription(
          transaction.order.description
        );
        const iterEmail = transaction.customer?.email;
        if (color === iterColor && email === iterEmail) {
          if (possibleTransactionMatch === null) {
            possibleTransactionMatch = transaction;
          }
          const diff = this.compareTransactionInvoices(
            firstTransaction,
            transaction
          );
          if (diffForMatch === null && diff !== null) {
            possibleTransactionMatch = transaction;
            diffForMatch = diff;
            continue;
          }
          if (diffForMatch !== null && diff !== null) {
            if (diff < diffForMatch) {
              possibleTransactionMatch = transaction;
              diffForMatch = diff;
            } else {
              this.logger.warn(
                `Possible collision (diff: ${diff}, ${diffForMatch}): ${combinedTransactions[0].order?.invoiceNumber}-${combinedTransactions[1].order?.invoiceNumber} (${firstTransaction.transId} ${transaction.transId})`
              );
            }
          }
        }
      }
    }
    if (possibleTransactionMatch) {
      const index = rightArr.findIndex(
        item => item === possibleTransactionMatch
      );
      if (index !== -1) {
        rightArr.splice(index, 1);
        combinedTransactions.push(possibleTransactionMatch);
        const message = `Found pair: ${combinedTransactions[0].transId} and ${combinedTransactions[1].transId}. color: ${color}, email: ${email}, invoices: ${combinedTransactions[0].order?.invoiceNumber}-${combinedTransactions[1].order?.invoiceNumber}`;
        this.logger.debug(message);
      } else {
        this.logger.error('Error: index cannot be -1');
      }
    }
    const result =
      combinedTransactions.length === 1
        ? [...leftArr, firstTransaction, ...rightArr]
        : [...leftArr, combinedTransactions, ...rightArr];
    return result;
  }
}
