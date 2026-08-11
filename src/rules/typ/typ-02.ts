import type { Rule, RuleFinding } from "../types.js";

// TYP-02 괄호 남용: 문장당 괄호 쌍 2개 이상. 자동(info).
// 근거: 국내 지침 표기(괄호 속 정보는 문장으로 풀기).
const PAREN_OPEN = /[([{（「【]/g;

export const typ02: Rule = {
  id: "TYP-02",
  group: "TYP",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const count = s.text.match(PAREN_OPEN)?.length ?? 0;
      if (count >= 2) {
        findings.push({
          ruleId: "TYP-02",
          message: `괄호가 ${count}개 있습니다. 괄호 안 내용을 문장으로 풀어 쓰세요.`,
          span: s.span,
          suggestion: "괄호 속 정보를 별도 문장으로 만드세요.",
        });
      }
    }
    return findings;
  },
};
