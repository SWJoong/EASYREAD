import type { Rule, RuleFinding } from "../types.js";

// SEN-02 복문/이어진 문장: 연결어미로 절 2개 이상 결합. 보조(오탐 있음 → warning).
// 근거: Inclusion Europe #14 · 국내 지침(한 문장 한 정보).
// 어절 기반 탐지: 접속부사(그리고/하지만 등)는 통째로 제외해 오탐을 줄인다.
const CONNECTIVE_ENDINGS = ["고", "며", "지만", "는데", "으며", "면서", "거나", "든지", "든가", "는데도"];
const EXCLUDE_WORDS = new Set([
  "하지만",
  "그렇지만",
  "그리고",
  "그러고",
  "그러며",
  "말고",
  "말며",
  "및",
]);

export const sen02: Rule = {
  id: "SEN-02",
  group: "SEN",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      if (s.words.length < 2) continue;
      const nonLast = s.words.slice(0, -1);
      const hasConnective = nonLast.some(
        (w) =>
          w.text.length >= 2 &&
          !EXCLUDE_WORDS.has(w.text) &&
          CONNECTIVE_ENDINGS.some((end) => w.text.endsWith(end)),
      );
      if (hasConnective) {
        findings.push({
          ruleId: "SEN-02",
          message: "여러 절이 이어진 복문입니다. 짧은 문장으로 나누세요.",
          span: s.span,
          suggestion: "'-고, -며, -지만, -는데'로 잇지 말고 문장을 끊으세요.",
        });
      }
    }
    return findings;
  },
};
