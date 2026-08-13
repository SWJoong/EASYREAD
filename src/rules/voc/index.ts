import type { Rule } from "../types.js";
import { voc01 } from "./voc-01.js";
import { voc02 } from "./voc-02.js";
import { voc03 } from "./voc-03.js";
import { voc04 } from "./voc-04.js";
import { voc05 } from "./voc-05.js";
import { voc06 } from "./voc-06.js";

export { voc01, voc02, voc03, voc04, voc05, voc06 };

/** VOC 규칙군. registry가 정적으로 조립한다. */
export const vocRules: readonly Rule[] = [voc01, voc02, voc03, voc04, voc05, voc06];
