import type { Rule } from "../types.js";
import { sen01 } from "./sen-01.js";
import { sen02 } from "./sen-02.js";
import { sen03 } from "./sen-03.js";
import { sen04 } from "./sen-04.js";
import { sen05 } from "./sen-05.js";

export { sen01, sen02, sen03, sen04, sen05 };

/** SEN 규칙군 전체. registry가 정적으로 조립한다. */
export const senRules: readonly Rule[] = [sen01, sen02, sen03, sen04, sen05];
