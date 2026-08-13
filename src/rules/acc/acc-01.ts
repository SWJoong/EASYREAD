import { extractDates } from "../../text/extractors.js";
import type { Rule, RuleFinding } from "../types.js";

// ACC-01 날짜/시간 불일치: 원문의 날짜·시간이 변환문에 없으면 error. requiresOriginal(원문 있을 때만).
// 근거: 정확성 원칙(guidelines §7) · ISO 24495. 사실 왜곡은 error.
export const acc01: Rule = {
  id: "ACC-01",
  group: "ACC",
  defaultSeverity: "error",
  requiresOriginal: true,
  check(ctx) {
    if (ctx.original === undefined) return [];
    const inConverted = new Set(extractDates(ctx.raw));
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const value of extractDates(ctx.original.raw)) {
      if (inConverted.has(value) || seen.has(value)) continue;
      seen.add(value);
      findings.push({
        ruleId: "ACC-01",
        message: `원문의 날짜 '${value}'이(가) 변환문에 없습니다. 날짜·시간은 원문과 똑같이 유지하세요.`,
        span: { start: 0, end: 0 },
      });
    }
    return findings;
  },
};
