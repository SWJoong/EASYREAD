import type { Rule, RuleFinding } from "../types.js";

// TYP-02 괄호 남용: 한 문장에 여는 괄호 '('가 2개 이상이면 문장당 info. 괄호 속 정보는 문장으로 풀기 제안.
// 근거: Inclusion Europe §2(괄호보다 문장) · guidelines §5.
const MIN_PARENS = 2;

export const typ02: Rule = {
  id: "TYP-02",
  group: "TYP",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const count = (s.text.match(/\(/g) ?? []).length;
      if (count >= MIN_PARENS) {
        findings.push({
          ruleId: "TYP-02",
          message: "한 문장에 괄호가 여러 개입니다. 괄호 속 내용을 문장으로 풀어 쓰세요.",
          span: s.span,
        });
      }
    }
    return findings;
  },
};
