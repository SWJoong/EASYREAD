import type { Rule, RuleFinding } from "../types.js";

// VOC-03 전문용어 뜻풀이 없음: 사전 terminology 어절이 문서 어디에도 풀이('~이란'·'~라는 뜻' 등)
// 없이 쓰이면 그 용어의 첫 사용 위치에 warning. 보조 규칙(오탐 있음).
// 근거: Inclusion Europe #7(어려운 낱말은 설명) · 국내 지침(전문용어 병기).
// 트리거는 voc-01과 같은 어절 정확 일치, 풀이 존재 여부만 원문 전체를 훑어 판정한다.

/** 정규식 특수문자 이스케이프. */
function escape(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 용어 뒤에 풀이 신호가 붙어 있으면 문서가 그 용어를 '설명한' 것으로 본다. */
function isExplained(term: string, raw: string): boolean {
  const t = escape(term);
  // (1) '용어' + 정의 연결('이란/란/이라는/라는/이라고/라고')
  if (new RegExp(`${t}\\s*(이란|란|이라는|라는|이라고|라고)`).test(raw)) return true;
  // (2) '용어' 뒤 15자 이내에 '뜻'·'의미' 등 풀이 신호
  if (new RegExp(`${t}[^.!?\\n]{0,15}(뜻|의미|말합니다|말한다|가리킵니다)`).test(raw)) return true;
  return false;
}

export const voc03: Rule = {
  id: "VOC-03",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        const entry = ctx.dictionary.lookup(w.text);
        if (entry?.category !== "terminology") continue;
        if (seen.has(w.text)) continue; // 용어별 첫 사용만
        seen.add(w.text);
        if (isExplained(w.text, ctx.raw)) continue; // 문서에 풀이가 있으면 통과
        findings.push({
          ruleId: "VOC-03",
          message: `'${w.text}'은(는) 전문용어입니다. 처음 나올 때 뜻을 함께 풀어 주세요.`,
          span: w.span,
          suggestion: entry.explanation ?? entry.alternatives.join(", "),
        });
      }
    }
    return findings;
  },
};
