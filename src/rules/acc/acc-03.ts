import { extractProperNouns } from "../../text/extractors.js";
import type { Rule, RuleFinding } from "../types.js";

// ACC-03 기관명/고유명사 누락: 원문의 기관명 후보가 변환문에 없으면 warning. requiresOriginal.
// 근거: 정확성 원칙(guidelines §7). 접미 휴리스틱이라 오탐 있음 → error가 아닌 warning(보조).
export const acc03: Rule = {
  id: "ACC-03",
  group: "ACC",
  defaultSeverity: "warning",
  requiresOriginal: true,
  check(ctx) {
    if (ctx.original === undefined) return [];
    const inConverted = new Set(extractProperNouns(ctx.raw));
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const value of extractProperNouns(ctx.original.raw)) {
      if (inConverted.has(value) || seen.has(value)) continue;
      seen.add(value);
      findings.push({
        ruleId: "ACC-03",
        message: `원문의 기관명 '${value}'이(가) 변환문에 없습니다. 기관명은 줄이지 말고 그대로 쓰세요.`,
        span: { start: 0, end: 0 },
      });
    }
    return findings;
  },
};
