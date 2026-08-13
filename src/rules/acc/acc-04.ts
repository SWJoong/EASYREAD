import { extractContacts } from "../../text/extractors.js";
import type { Rule, RuleFinding } from "../types.js";

// ACC-04 연락처/URL 불일치: 원문의 전화번호·URL이 변환문에 없으면 error. requiresOriginal.
// 근거: 정확성 원칙(guidelines §7). 연락처 오류는 실제 피해로 이어지므로 error.
export const acc04: Rule = {
  id: "ACC-04",
  group: "ACC",
  defaultSeverity: "error",
  requiresOriginal: true,
  check(ctx) {
    if (ctx.original === undefined) return [];
    const inConverted = new Set(extractContacts(ctx.raw));
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const value of extractContacts(ctx.original.raw)) {
      if (inConverted.has(value) || seen.has(value)) continue;
      seen.add(value);
      findings.push({
        ruleId: "ACC-04",
        message: `원문의 연락처 '${value}'이(가) 변환문에 없습니다. 전화번호·주소는 원문과 똑같이 유지하세요.`,
        span: { start: 0, end: 0 },
      });
    }
    return findings;
  },
};
