import type { Rule, RuleFinding } from "../types.js";

// VOC-06 지시어 과다: '이', '그', '해당' 등 지시어가 문장에 2개 이상이면 경고.
// 근거: Inclusion Europe #12(대상을 다시 부르기) · 국내 지침(지시어 최소화).
// 보조(info). 1음절 '이'/'그'는 한국어에서 관형사/조사 등과 동음이므로
// 어절 단위 정확 매칭만 하거나, 2음절 이상 지시어에 집중해 오탐을 줄인다.
const DEMONSTRATIVES: readonly string[] = [
  "해당",
  "이것",
  "그것",
  "저것",
  "이것은",
  "그것은",
  "이것을",
  "그것을",
  "이러한",
  "그러한",
  "저러한",
  "이런",
  "그런",
  "저런",
  "이와",
  "그와",
  "여기",
  "거기",
  "저기",
  "이곳",
  "그곳",
  "저곳",
];

export const voc06: Rule = {
  id: "VOC-06",
  group: "VOC",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      let count = 0;
      for (const w of s.words) {
        if (DEMONSTRATIVES.some((d) => w.text === d || w.text.startsWith(d))) {
          count++;
        }
      }
      if (count >= 2) {
        findings.push({
          ruleId: "VOC-06",
          message: "지시어(이것, 그것, 해당 등)가 많습니다. 가리키는 대상을 직접 쓰세요.",
          span: s.span,
          suggestion: "'이것', '그것' 대신 구체적인 이름을 다시 써 주세요.",
        });
      }
    }
    return findings;
  },
};
