import type { Rule } from "../types.js";
import { num01 } from "./num-01.js";
import { num02 } from "./num-02.js";
import { num03 } from "./num-03.js";
import { num04 } from "./num-04.js";

export { num01, num02, num03, num04 };

/** NUM 규칙군 전체. registry가 정적으로 조립한다. */
export const numRules: readonly Rule[] = [num01, num02, num03, num04];
