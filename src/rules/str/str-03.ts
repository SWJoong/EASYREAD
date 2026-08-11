import type { Rule, RuleFinding } from "../types.js";

// STR-03 3개 이상 나열이 문장 안에 있음 (목록화 권장). 보조(info).
// 근거: Inclusion Europe #14 · 국내 지침(세 가지 이상 나열은 목록으로).
// SEN-05와 유사하나, STR-03은 "목록으로 만들라"는 구성 관점의 제안.
// SEN-05가 이미 쉼표 나열을 탐지하므로, STR-03은 '또는/혹은' 나열을 보완 탐지한다.
const OR_CONNECTORS = /또는|혹은/g;

export const str03: Rule = {
  id: "STR-03",
  group: "STR",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const orCount = s.text.match(OR_CONNECTORS)?.length ?? 0;
      if (orCount >= 2) {
        findings.push({
          ruleId: "STR-03",
          message: "여러 선택지가 문장 안에 나열되어 있습니다. 글머리표 목록으로 바꾸세요.",
          span: s.span,
          suggestion: "'또는/혹은'으로 잇지 말고 각 항목을 목록으로 만드세요.",
        });
      }
    }
    return findings;
  },
};
