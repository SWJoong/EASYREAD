import type { Rule, RuleFinding } from "../types.js";

// VOC-03 전문용어 뜻풀이 없음: terminology 어절이 **같은 문장에** 풀이 없이 쓰이면 어절마다 warning.
// 근거: Inclusion Europe #7(어려운 낱말은 설명) · guidelines §2(바꿀 수 없는 용어는 뜻풀이).
// 풀이 판정(보조): 같은 문장 raw에 아래 마커가 하나라도 있으면 '설명됨'으로 보고 넘어간다.
// v0.1은 어절 정확 일치만(조사 결합 '임의가입의'는 미탐 — backlog).
const GLOSS_MARKERS = ["이란", "라는 뜻", "뜻입니다", "뜻이", "설명", "("];

export const voc03: Rule = {
  id: "VOC-03",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      if (GLOSS_MARKERS.some((m) => s.text.includes(m))) continue; // 같은 문장에 풀이가 있으면 통과
      for (const w of s.words) {
        const entry = ctx.dictionary.lookup(w.text);
        if (entry?.category === "terminology") {
          findings.push({
            ruleId: "VOC-03",
            message: `'${w.text}'은(는) 전문용어입니다. 처음 나올 때 뜻을 함께 풀어 주세요.`,
            span: w.span,
            suggestion: entry.explanation,
          });
        }
      }
    }
    return findings;
  },
};
