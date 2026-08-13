import type { Rule, RuleFinding } from "../types.js";

// VOC-04 추상어/관용구/비유: 사전 idiom 어절을 정확 일치로 찾아 info로 안내한다(VOC-01 패턴).
// 근거: Inclusion Europe #10(은유·비유 금지) · guidelines §2(추상어·비유·관용구를 피한다).
// 매칭 어절마다 1건. v0.1은 어절 정확 일치만(조사 결합 '활성화를'·다어절 관용구는 backlog).
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
          findings.push({
            ruleId: "VOC-04",
            message: `'${w.text}'은(는) 추상적이거나 비유적인 표현입니다. 구체적인 행동으로 풀어 쓰면 더 쉽습니다.`,
            span: w.span,
            suggestion: entry.alternatives.join(", "),
          });
        }
      }
    }
    return findings;
  },
};
