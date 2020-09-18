import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';
import Logger from '../../logger';
const logger = Logger(
  'src/preprocessors/combined/GeneralCombinedPreProcessor.ts'
);

export const SECOND_TRANSACTIONS_DESCRIPTION_STRING = [
  'Compact Upgrade',
  'COmpact',
  'Hardwood',
];

export function generateCombinedDescription(
  mainTransaction: TODO_ANY,
  upgradeTransaction: TODO_ANY
): string {
  const mainTransactionDescription = mainTransaction.order.description;
  const separatorMain = mainTransactionDescription.lastIndexOf(' ');
  const mainDescriptionPart = mainTransactionDescription.slice(
    0,
    separatorMain
  );
  const colorDescriptionPart = mainTransactionDescription.slice(
    separatorMain + 1
  );
  const upgradeTransactionDescription = upgradeTransaction.order.description;
  const separatorUpgrade = upgradeTransactionDescription.lastIndexOf(' ');
  const upgradeDescriptionPart = upgradeTransactionDescription.slice(
    0,
    separatorUpgrade
  );
  return `${mainDescriptionPart} [${upgradeDescriptionPart}] ${colorDescriptionPart}`;
}

export class GeneralCombinedPreProcessor implements PreProcessor {
  canWork(transaction: TODO_ANY): [boolean, number] {
    if (Array.isArray(transaction) && transaction.length === 2) {
      return [true, 1]; // 1 should be enough, this processor should have lowest priority to others
    }
    return [false, 0];
  }

  process(transaction: TODO_ANY): TODO_ANY {
    if (Array.isArray(transaction) && transaction.length === 2) {
      const upgradeTransaction = transaction.find(tr => {
        const description: string | undefined = tr.order?.description;
        if (description) {
          for (const stringCase of SECOND_TRANSACTIONS_DESCRIPTION_STRING) {
            if (description.includes(stringCase)) {
              return true;
            }
          }
        }
        return false;
      });
      const mainTransaction = transaction.find(tr => tr !== upgradeTransaction);
      if (mainTransaction && upgradeTransaction) {
        mainTransaction.authAmount += upgradeTransaction.authAmount;
        mainTransaction.settleAmount += upgradeTransaction.settleAmount;
        mainTransaction.order.description = generateCombinedDescription(
          mainTransaction,
          upgradeTransaction
        );
        return mainTransaction;
      } else {
        logger.warn(`Logic issues: ${mainTransaction} | ${upgradeTransaction}`);
      }
    }
    return transaction;
  }
}
