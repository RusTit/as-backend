import CombineRule from './CombineRule';
import { TODO_ANY } from '../Helper';

const COMPACT_DESCRIPTION_STRING = 'Compact Upgrade';

export default class CompactRule extends CombineRule {
  constructor() {
    super('src/combineRules/CompactRule.ts');
    this.DESCRIPTION_TO_MATCH = COMPACT_DESCRIPTION_STRING;
  }

  isAcceptable(transaction: TODO_ANY): boolean {
    if (Array.isArray(transaction)) {
      return false;
    }
    const description = transaction.order?.description?.toLowerCase();
    return description?.includes('compact');
  }
}
