import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';

export const BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION =
  'TT Patriot 35S Compact (RFID) (elite fingerprint)';

export class BiometricFingerprintSoloLock implements PreProcessor {
  canWork(transaction: TODO_ANY): [boolean, number] {
    if (!Array.isArray(transaction)) {
      const description: string | undefined = transaction.order.description;
      if (
        description &&
        description.includes(BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION)
      ) {
        return [true, BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION.length];
      }
    }
    return [false, 0];
  }

  process(transaction: TODO_ANY): TODO_ANY {
    const description: string | undefined = transaction.order.description;
    if (description) {
      transaction.order.description = description.replace(
        BIOMETRIC_FINGERPRINT_LOCK_DESCRIPTION,
        'TT Patriot 35s Compact (BIO)'
      );
    }
    return transaction;
  }
}
