import type { Rule, RuleFinding } from "../types.js";

// NUM-02 복잡한 비율/통계: 소수점 백분율 등 → "10명 중 N명" 제안. 자동(info).
// 근거: Inclusion Europe #18(감이 오게) · 국내 지침(큰 수·비율 단순화).
const COMPLEX_PERCENTAGE = /\d+\.\d+\s*%/g;

export const num02: Rule = {
  id: "NUM-02",
  group: "NUM",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      COMPLEX_PERCENTAGE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = COMPLEX_PERCENTAGE.exec(s.text)) !== null) {
        const start = s.span.start + m.index;
        findings.push({
          ruleId: "NUM-02",
          message: `'${m[0]}'은(는) 이해하기 어렵습니다. '10명 중 N명' 같은 표현이 더 쉽습니다.`,
          span: { start, end: start + m[0].length },
          suggestion: "소수점 백분율 대신 '10명 중 N명' 또는 '절반 정도'처럼 바꿔 보세요.",
        });
      }
    }
    return findings;
  },
};
