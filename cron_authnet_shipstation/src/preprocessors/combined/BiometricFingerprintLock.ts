import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';

export const BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION =
  'TT Patriot 35S Compact (RFID) (elite fingerprint)';

export class BiometricFingerprintLock implements PreProcessor {
  canWork(transactions: TODO_ANY): [boolean, number] {
    if (Array.isArray(transactions)) {
      for (const transaction of transactions) {
        const description: string | undefined = transaction.order.description;
        if (
          description &&
          description.includes(BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION)
        ) {
          return [true, BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION.length];
        }
      }
    }
    return [false, 0];
  }

  process(transactions: TODO_ANY): TODO_ANY {
    for (const transaction of transactions) {
      const description: string | undefined = transaction.order.description;
      if (
        description &&
        description.includes(BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION)
      ) {
        transaction.order.description = description.replace(
          BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION,
          'UP Pistol BIO'
        );
        break;
      }
    }
    return transactions;
  }
}
