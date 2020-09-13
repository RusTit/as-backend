import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';

export const BLUETOOTH_LOCK_DESCRIPTION =
  'TT Patriot 35S Compact (RFID) (elite)';

export class BluetoothSoloLock implements PreProcessor {
  canWork(transaction: TODO_ANY): [boolean, number] {
    if (!Array.isArray(transaction)) {
      const description: string | undefined = transaction.order.description;
      if (description && description.includes(BLUETOOTH_LOCK_DESCRIPTION)) {
        return [true, BLUETOOTH_LOCK_DESCRIPTION.length];
      }
    }
    return [false, 0];
  }

  process(transaction: TODO_ANY): TODO_ANY {
    const description: string | undefined = transaction.order.description;
    if (description) {
      transaction.order.description = description.replace(
        BLUETOOTH_LOCK_DESCRIPTION,
        'TT Patriot 35s Compact (BT)'
      );
    }
    return transaction;
  }
}
