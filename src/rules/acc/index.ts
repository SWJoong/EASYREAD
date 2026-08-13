import type { Rule } from "../types.js";
import { acc01 } from "./acc-01.js";
import { acc02 } from "./acc-02.js";
import { acc03 } from "./acc-03.js";
import { acc04 } from "./acc-04.js";

export { acc01, acc02, acc03, acc04 };

/** ACC 규칙군(사실 보존). requiresOriginal:true — 원문이 있을 때만 활성. */
export const accRules: readonly Rule[] = [acc01, acc02, acc03, acc04];
