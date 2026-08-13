import type { Word } from "../../text/index.js";
import type { Rule, RuleFinding } from "../types.js";

// VOC-06 지시어 과다: 지시어 어절 총수가 문장 수를 넘으면(밀도 > 문장당 1개) 문서 단위 info 1건.
// 근거: Inclusion Europe #12(대명사는 대상이 분명해야) · guidelines §2(지시어를 줄인다).
// 사전 불필요. 단일 글자 '이/그/저'는 어절 정확 일치라 '이순신'·'그림'을 잡지 않는다.
// 임계값(밀도)은 상수로 조정 가능. v0.1은 정확 일치만(조사 결합 '그것을'은 미탐 — backlog).
const DEMONSTRATIVES = new Set([
  "이", "그", "저", "이것", "그것", "저것", "이거", "그거", "해당",
  "이런", "그런", "저런", "이러한", "그러한", "저러한",
  "여기", "거기", "저기", "이곳", "그곳",
]);
const MAX_PER_SENTENCE = 1; // 문장당 허용 밀도(초과 시 과다)

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
    if (first === undefined || hits.length <= sentences * MAX_PER_SENTENCE) return [];
    return [
      {
        ruleId: "VOC-06",
        message: `지시어(이, 그, 해당 등)가 ${hits.length}번 나옵니다(문장 ${sentences}개). 가리키는 대상을 다시 적어 주세요.`,
        span: first.span,
      },
    ];
  },
};
