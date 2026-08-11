import type { Rule, RuleFinding } from "../types.js";

// VOC-02 불필요한 외래어/외국어: loanword 사전 매칭 + 로마자 연속 3자 이상 탐지.
// 근거: Inclusion Europe #8(일상어) · 국내 지침 어휘(한국어 대체어 우선).
const LATIN_SEQ = /[A-Za-z]{3,}/g;

export const voc02: Rule = {
  id: "VOC-02",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const loanEntries = ctx.dictionary.entries.filter((e) => e.category === "loanword");
    for (const s of ctx.sentences) {
      // 1) 사전 등록 외래어
      for (const entry of loanEntries) {
        let pos = 0;
        while ((pos = s.text.indexOf(entry.word, pos)) !== -1) {
          const start = s.span.start + pos;
          const alts = entry.alternatives.join(", ");
          findings.push({
            ruleId: "VOC-02",
            message: `'${entry.word}'은(는) 외래어입니다. '${alts}'(으)로 바꾸면 더 쉽습니다.`,
            span: { start, end: start + entry.word.length },
            suggestion: entry.example ?? `'${entry.alternatives[0]}'(으)로 바꿔 보세요.`,
          });
          pos += entry.word.length;
        }
      }
      // 2) 로마자 연속(사전 미등록 외국어)
      LATIN_SEQ.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = LATIN_SEQ.exec(s.text)) !== null) {
        const start = s.span.start + m.index;
        findings.push({
          ruleId: "VOC-02",
          message: `'${m[0]}'은(는) 외국어입니다. 한국어로 바꾸거나 뜻을 함께 적으세요.`,
          span: { start, end: start + m[0].length },
          suggestion: "한국어 대체어를 쓰거나, 괄호 안에 뜻을 적어 주세요.",
        });
      }
    }
    return findings;
  },
};
