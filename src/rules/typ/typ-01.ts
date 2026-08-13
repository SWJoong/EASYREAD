import type { Rule, RuleFinding } from "../types.js";

// TYP-01 풀어 쓰지 않은 기호: {※, ~, &, /} 출현마다 warning. 말로 풀어쓰기 제안.
// 근거: Inclusion Europe(특수기호 대신 낱말) · guidelines §5('~'는 '부터/까지').
const SYMBOLS = new RegExp("[※~&/]", "g");

export const typ01: Rule = {
  id: "TYP-01",
  group: "TYP",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const m of ctx.raw.matchAll(SYMBOLS)) {
      const start = m.index ?? 0;
      findings.push({
        ruleId: "TYP-01",
        message: `기호 '${m[0]}'은(는) 말로 풀어 쓰세요. 예: '~'→'부터/까지', '&'→'그리고', '/'→'또는'.`,
        span: { start, end: start + 1 },
      });
    }
    return findings;
  },
};
