import type { Rule, RuleFinding } from "../types.js";

// TYP-03 쌍점/쌍반점: ':'·';' 출현마다 info. 문장으로 풀어쓰기 제안.
// 단, 숫자 사이의 ':'(시각 '3:00')는 오탐 방지를 위해 제외한다.
// 근거: 쉬운 언어 일반 원칙(문장부호 절제).
export const typ03: Rule = {
  id: "TYP-03",
  group: "TYP",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    const raw = ctx.raw;
    for (let i = 0; i < raw.length; i++) {
      const c = raw[i];
      if (c === ";") {
        findings.push({ ruleId: "TYP-03", message: "쌍반점(;)은 문장으로 풀어 쓰세요.", span: { start: i, end: i + 1 } });
      } else if (c === ":") {
        const prev = raw[i - 1];
        const next = raw[i + 1];
        const betweenDigits = prev !== undefined && next !== undefined && /\d/.test(prev) && /\d/.test(next);
        if (!betweenDigits) {
          findings.push({ ruleId: "TYP-03", message: "쌍점(:)은 문장으로 풀어 쓰세요.", span: { start: i, end: i + 1 } });
        }
      }
    }
    return findings;
  },
};
