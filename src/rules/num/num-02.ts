import type { Rule, RuleFinding } from "../types.js";

// NUM-02 복잡한 비율: 소수점 백분율(예 47.3%)마다 info. '10명 중 몇 명'식으로 풀어쓰기 제안.
// 근거: Inclusion Europe #13(백분율 지양). 정수 백분율('50%')은 v0.1 대상 아님.
const DECIMAL_PERCENT = /\d+\.\d+\s*%/g;

export const num02: Rule = {
  id: "NUM-02",
  group: "NUM",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const m of ctx.raw.matchAll(DECIMAL_PERCENT)) {
      const start = m.index ?? 0;
      findings.push({
        ruleId: "NUM-02",
        message: `'${m[0]}'처럼 복잡한 비율은 이해하기 어렵습니다. '10명 중 몇 명'처럼 쉽게 쓰세요.`,
        span: { start, end: start + m[0].length },
      });
    }
    return findings;
  },
};
