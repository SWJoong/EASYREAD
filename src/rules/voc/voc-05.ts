import type { Rule, RuleFinding } from "../types.js";

// VOC-05 풀이 없는 줄임말/약어: 사전 abbreviation 어절의 '첫 사용' 바로 뒤에 괄호 풀이가 없으면 warning.
// 근거: Inclusion Europe #7 · 국내 지침(약어 첫 등장 시 원말 병기).
// 어절 정확 일치, 약어별 첫 등장만. 첫 등장 뒤 '('(공백 허용)가 오면 풀이된 것으로 본다.
export const voc05: Rule = {
  id: "VOC-05",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        const entry = ctx.dictionary.lookup(w.text);
        if (entry?.category !== "abbreviation") continue;
        if (seen.has(w.text)) continue; // 첫 사용만
        seen.add(w.text);
        // 바로 뒤(공백 허용)에 괄호 풀이가 있으면 통과
        if (/^\s*\(/.test(ctx.raw.slice(w.span.end))) continue;
        findings.push({
          ruleId: "VOC-05",
          message: `'${w.text}'은(는) 줄임말입니다. 처음 나올 때 '${entry.alternatives.join(", ")}'처럼 뜻을 함께 적으세요.`,
          span: w.span,
          suggestion: entry.alternatives.join(", "),
        });
      }
    }
    return findings;
  },
};
