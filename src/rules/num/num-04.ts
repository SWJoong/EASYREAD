import type { Rule, RuleFinding } from "../types.js";

// NUM-04 읽기 어려운 큰 수: 자릿수 콤마가 2개 이상인 수 → 만/억 단위 제안. 자동(info).
// 근거: 국내 지침(금액·큰 수는 읽기 쉽게).
// '1,000,000원' → '100만 원', '10,000' → '1만'.
const LARGE_NUMBER = /\d{1,3}(,\d{3}){2,}/g;

export const num04: Rule = {
  id: "NUM-04",
  group: "NUM",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      LARGE_NUMBER.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = LARGE_NUMBER.exec(s.text)) !== null) {
        const start = s.span.start + m.index;
        findings.push({
          ruleId: "NUM-04",
          message: `'${m[0]}'은(는) 한눈에 읽기 어렵습니다. '만', '억' 단위로 바꾸세요.`,
          span: { start, end: start + m[0].length },
          suggestion: "예: '1,000,000' → '100만', '10,000' → '1만'.",
        });
      }
    }
    return findings;
  },
};
