import type { Rule, RuleFinding } from "../types.js";

// STR-02 단락이 너무 길다: 문장 5개 초과. 자동(info).
// 근거: Inclusion Europe #14(짧은 단락) · 국내 지침(한 단락 한 주제).
const MAX_SENTENCES_PER_PARAGRAPH = 5;

export const str02: Rule = {
  id: "STR-02",
  group: "STR",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const p of ctx.paragraphs) {
      if (p.sentences.length > MAX_SENTENCES_PER_PARAGRAPH) {
        findings.push({
          ruleId: "STR-02",
          message: `단락이 깁니다(문장 ${p.sentences.length}개). 소제목을 넣어 나누세요.`,
          span: p.span,
          suggestion: `한 단락에 ${MAX_SENTENCES_PER_PARAGRAPH}문장 이하로 쓰세요.`,
        });
      }
    }
    return findings;
  },
};
