import type { Word } from "../../text/index.js";
import type { Rule, RuleFinding } from "../types.js";

// VOC-06 지시어 과다: 지시어(이/그/해당/상기 등) 어절이 문장 수 대비 과다하면 info 1건.
// 근거: Inclusion Europe #9(가리키는 대상을 다시 쓴다) · 국내 지침(지시어 절제).
// 밀도 = 지시어 수 / 문장 수. 임계값은 보조·info 기준의 잠정값(골든 테스트로 확정).
const DEMONSTRATIVES = new Set([
  "이", "그", "저", "본", "동",
  "이것", "그것", "저것", "이거", "그거",
  "이런", "그런", "저런", "이러한", "그러한", "저러한",
  "해당", "상기", "이때", "그때", "여기", "거기", "이곳", "그곳",
]);
const MIN_COUNT = 3; // 짧은 글의 오탐을 막는 최소 발생 수
const MIN_RATIO = 0.5; // 문장당 평균 지시어 수가 이보다 크면 과다로 본다

export const voc06: Rule = {
  id: "VOC-06",
  group: "VOC",
  defaultSeverity: "info",
  check(ctx): RuleFinding[] {
    const hits: Word[] = [];
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        if (DEMONSTRATIVES.has(w.text)) hits.push(w);
      }
    }
    const sentences = ctx.sentences.length;
    const first = hits[0];
    if (sentences === 0 || hits.length < MIN_COUNT || first === undefined) return [];
    if (hits.length / sentences <= MIN_RATIO) return [];
    return [
      {
        ruleId: "VOC-06",
        message: `지시어(이, 그, 해당 등)가 ${hits.length}번 나옵니다(문장 ${sentences}개). 가리키는 대상을 다시 적어 주세요.`,
        span: first.span,
      },
    ];
  },
};
