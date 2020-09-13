import { TODO_ANY } from '../Helper';

export interface PreProcessor {
  canWork(transaction: TODO_ANY): [boolean, number];
  process(transaction: TODO_ANY): TODO_ANY;
}
