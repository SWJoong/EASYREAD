import type { Rule } from "../types.js";
import { str01 } from "./str-01.js";
import { str02 } from "./str-02.js";
import { str03 } from "./str-03.js";
import { str04 } from "./str-04.js";

export { str01, str02, str03, str04 };

/** STR 규칙군 전체. registry가 정적으로 조립한다. */
export const strRules: readonly Rule[] = [str01, str02, str03, str04];
