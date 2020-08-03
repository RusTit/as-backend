import { TransactionIssuesEntity } from './TransactionIssues.entity';

export const mockRepository = {
  async save(): Promise<void> {
    return Promise.resolve();
  },

  async find(): Promise<TransactionIssuesEntity[]> {
    return [];
  },
};
