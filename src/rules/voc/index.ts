import type { Rule } from "../types.js";
import { voc01 } from "./voc-01.js";
import { voc02 } from "./voc-02.js";

export { voc01, voc02 };

/** VOC 규칙군(자동 판정). registry가 정적으로 조립한다. */
export const vocRules: readonly Rule[] = [voc01, voc02];
