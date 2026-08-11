import type { Rule, RuleFinding } from "../types.js";

// STR-04 절차에 단계 번호 없음: 수동 규칙이므로 점검 질문. info.
// 근거: Inclusion Europe #14 · 국내 지침(절차는 순서대로 번호).
// 절차 힌트 단어('먼저/다음/그 다음/그리고 나서/마지막으로')가 2개 이상이면
// 순서가 있는 절차로 보고, 번호가 없으면 점검 질문을 띄운다.
const SEQUENCE_HINTS = /먼저|다음으로|그\s*다음|그리고\s*나서|마지막으로|그\s*후에/g;

export const str04: Rule = {
  id: "STR-04",
  group: "STR",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const fullText = ctx.raw;
    const hintCount = fullText.match(SEQUENCE_HINTS)?.length ?? 0;
    const hasNumbering = /^\s*\d+[.)]\s/m.test(fullText);
    if (hintCount >= 2 && !hasNumbering) {
      findings.push({
        ruleId: "STR-04",
        message: "순서가 있는 절차처럼 보입니다. 단계 번호(1, 2, 3)를 붙이세요.",
        span: { start: 0, end: Math.min(fullText.length, 1) },
        suggestion: "각 단계를 '1. …', '2. …' 번호 목록으로 만드세요.",
      });
    }
    return findings;
  },
};
