import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';

export const ReconCases = new Map<string, string>();
ReconCases.set('Recon LX1 Watch', 'Recon Smart Watch');
ReconCases.set('The New Recon Tactical Smart Watch', 'Recon Smart Watch');

export class ReconSmartWatchSoloPreProcessor implements PreProcessor {
  canWork(transaction: TODO_ANY): [boolean, number] {
    if (!Array.isArray(transaction)) {
      const description: string | undefined = transaction.order.description;
      if (description) {
        for (const key of ReconCases.keys()) {
          if (description.includes(key)) {
            return [true, key.length];
          }
        }
      }
    }
    return [false, 0];
  }

  process(transaction: TODO_ANY): TODO_ANY {
    if (!Array.isArray(transaction)) {
      const description: string | undefined = transaction.order.description;
      if (description) {
        for (const key of ReconCases.keys()) {
          if (description.includes(key)) {
            transaction.order.description = description
              .replace(key, ReconCases.get(key) as string)
              .trim();
            return transaction;
          }
        }
      }
    }
    return transaction;
  }
}
