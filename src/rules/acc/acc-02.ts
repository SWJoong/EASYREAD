import { extractAmounts } from "../../text/extractors.js";
import type { Rule, RuleFinding } from "../types.js";

// ACC-02 금액/수량 불일치: 원문의 금액·수량이 변환문에 없으면 error. requiresOriginal.
// 근거: 정확성 원칙(guidelines §7). NUM-02식 의도된 단순화 병기 판정은 backlog.
export const acc02: Rule = {
  id: "ACC-02",
  group: "ACC",
  defaultSeverity: "error",
  requiresOriginal: true,
  check(ctx) {
    if (ctx.original === undefined) return [];
    const inConverted = new Set(extractAmounts(ctx.raw));
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const value of extractAmounts(ctx.original.raw)) {
      if (inConverted.has(value) || seen.has(value)) continue;
      seen.add(value);
      findings.push({
        ruleId: "ACC-02",
        message: `원문의 금액·수량 '${value}'이(가) 변환문에 없습니다. 숫자는 원문과 똑같이 유지하세요.`,
        span: { start: 0, end: 0 },
      });
    }
    return findings;
  },
};
