import type { Rule, RuleFinding } from "../types.js";

// VOC-03 전문용어에 뜻풀이 없음: terminology 사전 매칭 + 인접 텍스트에 설명 패턴 확인.
// 근거: Inclusion Europe #9(전문용어에 설명) · 국내 지침(바꿀 수 없는 용어는 뜻풀이).
// 보조 규칙(오탐 가능 → warning).
const EXPLANATION_PATTERNS = [
  /이란\s/, // ~이란 ...
  /이라는\s/, // ~이라는 ...
  /은\s.*뜻/, // ~은 ... 뜻
  /는\s.*뜻/, // ~는 ... 뜻
  /\(.*\)/, // 괄호 안 설명
];

export const voc03: Rule = {
  id: "VOC-03",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const termEntries = ctx.dictionary.entries.filter((e) => e.category === "terminology");
    for (const s of ctx.sentences) {
      for (const entry of termEntries) {
        const pos = s.text.indexOf(entry.word);
        if (pos === -1) continue;
        // 같은 문장 뒤쪽에 풀이 패턴이 있으면 통과
        const after = s.text.slice(pos + entry.word.length);
        const hasExplanation = EXPLANATION_PATTERNS.some((p) => p.test(after));
        if (!hasExplanation) {
          const start = s.span.start + pos;
          findings.push({
            ruleId: "VOC-03",
            message: `'${entry.word}'은(는) 전문 용어입니다. 뜻을 함께 적어 주세요.`,
            span: { start, end: start + entry.word.length },
            suggestion: entry.explanation
              ? `'${entry.word}'은(는) ${entry.explanation}.`
              : `'${entry.word}' 뒤에 뜻풀이를 넣으세요.`,
          });
        }
      }
    }
    return findings;
  },
};
