import type { Rule, RuleFinding } from "../types.js";

// SEN-01 문장이 너무 길다: 어절 수 임계값 초과(기본 >10 warning, >15 error, 설정 가능).
// 근거: Inclusion Europe #14(짧은 문장) · ISO 24495-1(이해 쉬움) · 국내 지침 문장쓰기.
export const sen01: Rule = {
  id: "SEN-01",
  group: "SEN",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const n = s.wordCount;
      if (n > ctx.config.maxWordsError) {
        findings.push({
          ruleId: "SEN-01",
          severity: "error",
          message: `문장이 너무 깁니다(어절 ${n}개). 두 문장 이상으로 나누세요.`,
          span: s.span,
          suggestion: "한 문장에 한 가지 정보만 담으세요.",
        });
      } else if (n > ctx.config.maxWordsWarning) {
        findings.push({
          ruleId: "SEN-01",
          severity: "warning",
          message: `문장이 조금 깁니다(어절 ${n}개). 나누면 더 쉽습니다.`,
          span: s.span,
          suggestion: "한 문장에 한 가지 정보만 담으세요.",
        });
      }
    }
    return findings;
  },
};
