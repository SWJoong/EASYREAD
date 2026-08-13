import type { Rule, RuleFinding } from "../types.js";

// STR-02 단락이 너무 길다: 한 문단의 문장 수가 임계값(5)을 넘으면 문단마다 info.
// 근거: Inclusion Europe(짧은 단락) · guidelines §4(한 단락 한 주제). 임계값은 상수로 조정 가능.
const MAX_SENTENCES = 5;

export const str02: Rule = {
  id: "STR-02",
  group: "STR",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const p of ctx.paragraphs) {
      if (p.sentences.length > MAX_SENTENCES) {
        findings.push({
          ruleId: "STR-02",
          message: `한 단락에 문장이 ${p.sentences.length}개입니다. ${MAX_SENTENCES}개 이하로 나누면 더 쉽습니다.`,
          span: p.span,
        });
      }
    }
    return findings;
  },
};
