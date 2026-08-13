import type { Rule, RuleFinding } from "../types.js";

// VOC-05 풀이 없는 줄임말/약어: abbreviation 어절의 '첫 등장'에 괄호 풀이가 없으면 warning.
// 근거: Inclusion Europe #12(약어 지양·풀어 설명) · guidelines §2(줄임말은 첫 등장에서 풀어 쓴다).
// 문서 전체(문장 순서)에서 약어별 첫 등장만 판정. 풀이 판정: 매칭 어절에 '(' 포함 또는
// 바로 다음 어절이 '('로 시작. v0.1은 어절 정확 일치만(조사 결합 'WHO가'는 미탐 — backlog).
export const voc05: Rule = {
  id: "VOC-05",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    const words = ctx.sentences.flatMap((s) => s.words);
    for (const [i, w] of words.entries()) {
      const entry = ctx.dictionary.lookup(w.text);
      if (entry?.category !== "abbreviation") continue;
      if (seen.has(w.text)) continue; // 각 약어의 첫 등장만
      seen.add(w.text);
      const next = words[i + 1];
      const glossed = w.text.includes("(") || (next !== undefined && next.text.startsWith("("));
      if (glossed) continue;
      findings.push({
        ruleId: "VOC-05",
        message: `'${w.text}'은(는) 줄임말입니다. 처음 나올 때 '${entry.alternatives.join(", ")}'처럼 뜻을 함께 적으세요.`,
        span: w.span,
        suggestion: entry.alternatives.join(", "),
      });
    }
    return findings;
  },
};
