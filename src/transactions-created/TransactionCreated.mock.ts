import { TransactionCreatedEntity } from './TransactionCreated.entity';

export const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionCreatedEntity[]> {
    return [];
  },

  async findOne(): Promise<TransactionCreatedEntity | null> {
    return null;
  },
};
