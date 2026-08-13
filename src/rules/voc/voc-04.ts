import type { Rule, RuleFinding } from "../types.js";

// VOC-04 추상어/관용구/비유: 사전 idiom 어절을 정확 일치로 찾아 info로 안내한다.
// 근거: Inclusion Europe #8(구체적으로 표현) · 국내 지침(비유·추상어 지양).
// voc-01과 같은 어절 정확 일치(v0.1). 조사 결합형은 T-08 사전 helper로 확장.
export const voc04: Rule = {
  id: "VOC-04",
  group: "VOC",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        const entry = ctx.dictionary.lookup(w.text);
        if (entry?.category === "idiom") {
          const alts = entry.alternatives.join(", ");
          findings.push({
            ruleId: "VOC-04",
            message: `'${w.text}'은(는) 추상적이거나 비유적인 표현입니다. 뜻을 직접 풀어 쓰면 더 쉽습니다.`,
            span: w.span,
            suggestion: alts,
          });
        }
      }
    }
    return findings;
  },
};
