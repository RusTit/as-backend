import { PreProcessor } from '../PreProcessor';
import { TODO_ANY } from '../../Helper';

export const STANDART_RFID_LOCK_DESCRIPTION = 'TT Patriot 35S COmpact (RFID)';

export class StandartRFIDLock implements PreProcessor {
  canWork(transactions: TODO_ANY): [boolean, number] {
    if (Array.isArray(transactions)) {
      for (const transaction of transactions) {
        const description: string | undefined = transaction.order.description;
        if (
          description &&
          description.includes(STANDART_RFID_LOCK_DESCRIPTION)
        ) {
          return [true, STANDART_RFID_LOCK_DESCRIPTION.length];
        }
      }
    }
    return [false, 0];
  }

  process(transactions: TODO_ANY): TODO_ANY {
    for (const transaction of transactions) {
      const description: string | undefined = transaction.order.description;
      if (description && description.includes(STANDART_RFID_LOCK_DESCRIPTION)) {
        transaction.order.description = description.replace(
          STANDART_RFID_LOCK_DESCRIPTION,
          'UP Pistol RFID'
        );
        break;
      }
    }
    return transactions;
  }
}
