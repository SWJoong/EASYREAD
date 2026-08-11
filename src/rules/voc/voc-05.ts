import type { Rule, RuleFinding } from "../types.js";

// VOC-05 풀이 없는 약어 첫 사용: abbreviation 사전 매칭 + 첫 등장에 괄호 풀이 확인.
// 근거: Inclusion Europe #11(약어 첫 등장에서 풀기) · 국내 지침 어휘.
// 보조(warning).
export const voc05: Rule = {
  id: "VOC-05",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const abbrEntries = ctx.dictionary.entries.filter((e) => e.category === "abbreviation");
    const seen = new Set<string>();
    for (const s of ctx.sentences) {
      for (const entry of abbrEntries) {
        const pos = s.text.indexOf(entry.word);
        if (pos === -1) continue;
        const isFirst = !seen.has(entry.word);
        if (isFirst) {
          seen.add(entry.word);
          // 약어 바로 뒤에 괄호 풀이가 있으면 통과
          const after = s.text.slice(pos + entry.word.length);
          if (/^\s*\(/.test(after)) continue;
          const start = s.span.start + pos;
          const fullForm = entry.alternatives[0];
          findings.push({
            ruleId: "VOC-05",
            message: `'${entry.word}'은(는) 줄임말입니다. 처음 나올 때 전체 이름을 함께 적어 주세요.`,
            span: { start, end: start + entry.word.length },
            suggestion: `'${fullForm}(${entry.word})' 또는 '${entry.word}(${fullForm})'로 적으세요.`,
          });
        }
      }
    }
    return findings;
  },
};
