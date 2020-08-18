import CombineRule from './CombineRule';
import { TODO_ANY } from '../Helper';

const HARDWOOD_DESCRIPTION_STRING = 'Hardwood';

export default class HardwoodRule extends CombineRule {
  constructor() {
    super('src/combineRules/HardwoodRule.ts');
    this.DESCRIPTION_TO_MATCH = [HARDWOOD_DESCRIPTION_STRING];
  }

  isAcceptable(transaction: TODO_ANY): boolean {
    if (Array.isArray(transaction)) {
      return false;
    }
    return true;
  }
}
