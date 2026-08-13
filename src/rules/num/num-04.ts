import type { Rule, RuleFinding } from "../types.js";

// NUM-04 읽기 어려운 큰 수: 천단위 콤마 숫자(예 1,000,000)마다 info. '100만 원'식 단위 끊어쓰기 제안.
// 근거: Inclusion Europe #13(큰 수 지양) · 국내 지침(만/억 단위). 콤마 없는 '1000'은 대상 아님.
const BIG_NUMBER = /\d{1,3}(,\d{3})+/g;

export const num04: Rule = {
  id: "NUM-04",
  group: "NUM",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const m of ctx.raw.matchAll(BIG_NUMBER)) {
      const start = m.index ?? 0;
      findings.push({
        ruleId: "NUM-04",
        message: `'${m[0]}'은(는) 읽기 어려운 큰 수입니다. '100만 원'처럼 단위로 끊어 쓰세요.`,
        span: { start, end: start + m[0].length },
      });
    }
    return findings;
  },
};
