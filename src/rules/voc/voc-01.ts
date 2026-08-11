import type { Rule, RuleFinding } from "../types.js";

// VOC-01 어려운 한자어: 어절 정확 일치로 difficult 사전 매칭 → 대체어 제안.
// 근거: Inclusion Europe #8(일상어 사용) · ISO 24495-1(독자가 이해) · 국내 지침 어휘.
// v0.1은 어절 정확 일치만. 조사 결합 형태('상기의')는 T-08 사전 helper로 확장.
export const voc01: Rule = {
  id: "VOC-01",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        const entry = ctx.dictionary.lookup(w.text);
        if (entry?.category === "difficult") {
          const alts = entry.alternatives.join(", ");
          findings.push({
            ruleId: "VOC-01",
            message: `'${w.text}'은(는) 어려운 말입니다. '${alts}'(으)로 바꾸면 더 쉽습니다.`,
            span: w.span,
            suggestion: alts,
          });
        }
      }
    }
    return findings;
  },
};
