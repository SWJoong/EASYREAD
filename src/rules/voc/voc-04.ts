import type { Rule, RuleFinding } from "../types.js";

// VOC-04 추상어/관용구/비유 표현: idiom 사전 매칭. 보조(info).
// 근거: Inclusion Europe #10(구체적으로) · 국내 지침(비유·관용구 금지).
export const voc04: Rule = {
  id: "VOC-04",
  group: "VOC",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const idiomEntries = ctx.dictionary.entries.filter((e) => e.category === "idiom");
    for (const s of ctx.sentences) {
      for (const entry of idiomEntries) {
        let pos = 0;
        while ((pos = s.text.indexOf(entry.word, pos)) !== -1) {
          const start = s.span.start + pos;
          const alts = entry.alternatives.join(", ");
          findings.push({
            ruleId: "VOC-04",
            message: `'${entry.word}'은(는) 추상적이거나 비유적인 표현입니다. '${alts}'처럼 구체적으로 쓰세요.`,
            span: { start, end: start + entry.word.length },
            suggestion: entry.explanation
              ? `'${entry.word}'은(는) '${entry.explanation}'이라는 뜻입니다. '${entry.alternatives[0]}'(으)로 바꿔 보세요.`
              : `'${entry.alternatives[0]}'(으)로 바꿔 보세요.`,
          });
          pos += entry.word.length;
        }
      }
    }
    return findings;
  },
};
