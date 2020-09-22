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

export function extractMetaFromDescription(
  description: string
): [string, Map<string, string>] {
  const result = new Map<string, string>();
  const words = description.split(' ');
  let metaFound = false;
  const descWords: string[] = [];
  const metaWords: string[] = [];
  words.forEach(word => {
    if (metaFound) {
      metaWords.push(word);
    } else if (word.includes(':')) {
      metaFound = true;
      metaWords.push(word);
    } else {
      descWords.push(word);
    }
  });
  let currentWord = '';
  for (const word of metaWords) {
    let value = '';
    if (word.includes(':')) {
      const [kWord, kValue] = word.split(':');
      currentWord = kWord;
      value = kValue;
    } else {
      value = word;
    }
    let rValue = result.get(currentWord);
    if (typeof rValue === 'undefined') {
      rValue = value;
    } else {
      rValue += ` ${value}`;
    }
    result.set(currentWord, rValue);
  }
  const cleanDescription = descWords.join(' ');
  return [cleanDescription, result];
}

export function generateCombinedDescription(
  mainTransaction: TODO_ANY,
  upgradeTransaction: TODO_ANY
): string {
  const mainTransactionDescription = mainTransaction.order.description;
  const [mainDescriptionPart, metaMap] = extractMetaFromDescription(
    mainTransactionDescription
  );
  const colorDescriptionPart = `color:${metaMap.get('color')}`;
  const upgradeTransactionDescription = upgradeTransaction.order.description;
  const [upgradeDescriptionPart] = extractMetaFromDescription(
    upgradeTransactionDescription
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
