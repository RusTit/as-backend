import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';

export const BLUETOOTH_LOCK_DESCRIPTION =
  'TT Patriot 35S Compact (RFID) (elite)';

export const CASE_DESCRIPTION = 'UP Pistol BT';

export class BluetoothLock implements PreProcessor {
  canWork(transactions: TODO_ANY): [boolean, number] {
    if (Array.isArray(transactions)) {
      for (const transaction of transactions) {
        const description: string | undefined = transaction.order.description;
        if (description && description.includes(BLUETOOTH_LOCK_DESCRIPTION)) {
          return [true, BLUETOOTH_LOCK_DESCRIPTION.length];
        }
      }
    }
    return [false, 0];
  }

  process(transactions: TODO_ANY): TODO_ANY {
    if (Array.isArray(transactions) && transactions.length == 2) {
      const mainTransaction: TODO_ANY = transactions.find(
        tr =>
          tr.order.description &&
          tr.order.description.includes(BLUETOOTH_LOCK_DESCRIPTION)
      );
      if (mainTransaction) {
        mainTransaction.order.description = mainTransaction.order.description.replace(
          BLUETOOTH_LOCK_DESCRIPTION,
          CASE_DESCRIPTION
        );
        const upgradeTransaction = transactions.find(
          tr => tr !== mainTransaction
        );
        mainTransaction.authAmount += upgradeTransaction.authAmount;
        mainTransaction.settleAmount += upgradeTransaction.settleAmount;
        return mainTransaction;
      }
    }
    return transactions;
  }
}
