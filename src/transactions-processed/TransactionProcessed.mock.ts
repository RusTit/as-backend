import { TransactionProcessedEntity } from './TransactionProcessed.entity';

export const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionProcessedEntity[]> {
    return [];
  },
};
