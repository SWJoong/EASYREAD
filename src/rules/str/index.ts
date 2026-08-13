import type { Rule } from "../types.js";
import { str02 } from "./str-02.js";
import { str03 } from "./str-03.js";

export { str02, str03 };

/**
 * STR 규칙군. registry가 정적으로 조립한다.
 * STR-01(결론 먼저)·STR-04(절차 번호)는 자동 탐지 규칙이 아니라 리포트 점검 안내(PROC류)로 다룬다.
 */
export const strRules: readonly Rule[] = [str02, str03];
