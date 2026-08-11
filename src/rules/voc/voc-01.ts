import type { Rule, RuleFinding } from "../types.js";

// VOC-01 어려운 한자어: dictionary의 difficult 항목이 텍스트에 등장하면 대체어 제안.
// 근거: Inclusion Europe #8(일상어 사용) · ISO 24495-1(독자가 이해) · 국내 지침 어휘.
export const voc01: Rule = {
  id: "VOC-01",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const difficultEntries = ctx.dictionary.entries.filter((e) => e.category === "difficult");
    for (const s of ctx.sentences) {
      for (const entry of difficultEntries) {
        let pos = 0;
        while ((pos = s.text.indexOf(entry.word, pos)) !== -1) {
          const start = s.span.start + pos;
          const alts = entry.alternatives.join(", ");
          findings.push({
            ruleId: "VOC-01",
            message: `'${entry.word}'은(는) 어려운 말입니다. '${alts}'(으)로 바꾸면 더 쉽습니다.`,
            span: { start, end: start + entry.word.length },
            suggestion: entry.example ?? `'${entry.alternatives[0]}'(으)로 바꿔 보세요.`,
          });
          pos += entry.word.length;
        }
      }
    }
    return findings;
  },
};
