import type { Rule } from "../types.js";
import { typ01 } from "./typ-01.js";
import { typ02 } from "./typ-02.js";
import { typ03 } from "./typ-03.js";

export { typ01, typ02, typ03 };

/** TYP 규칙군 전체. registry가 정적으로 조립한다. */
export const typRules: readonly Rule[] = [typ01, typ02, typ03];
