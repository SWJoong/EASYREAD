import type { Rule, RuleFinding } from "../types.js";

// STR-03 문장 내 나열: 한 문장의 나열 구분자(',' '·' '、')가 2개 이상(항목 3개 이상)이면 문장당 info.
// 근거: Inclusion Europe #19(같은 주제 묶기) · guidelines §4(나열은 목록으로). 오탐 있음 → info.
const LIST_SEPARATOR = /[,·、]/g;
const MIN_SEPARATORS = 2;

export const str03: Rule = {
  id: "STR-03",
  group: "STR",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const count = (s.text.match(LIST_SEPARATOR) ?? []).length;
      if (count >= MIN_SEPARATORS) {
        findings.push({
          ruleId: "STR-03",
          message: "한 문장에 여러 항목이 나열돼 있습니다. 글머리표 목록으로 나누면 더 쉽습니다.",
          span: s.span,
        });
      }
    }
    return findings;
  },
};
