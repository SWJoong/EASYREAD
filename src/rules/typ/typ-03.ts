import type { Rule, RuleFinding } from "../types.js";

// TYP-03 쌍점/쌍반점 사용: 문장에 : 또는 ; 가 있으면 문장으로 풀기 제안. 자동(info).
// 근거: 국내 지침 표기(쌍점·쌍반점 피하기).
// 시간 표기('10:30')와 URL(':')은 제외한다.
const COLON_SEMICOLON = /[:;：；]/g;

export const typ03: Rule = {
  id: "TYP-03",
  group: "TYP",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      COLON_SEMICOLON.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = COLON_SEMICOLON.exec(s.text)) !== null) {
        // 시간 표기 제외 (숫자:숫자)
        if (m[0] === ":" || m[0] === "：") {
          const before = s.text[m.index - 1];
          const after = s.text[m.index + 1];
          if (before && after && /\d/.test(before) && /\d/.test(after)) continue;
          // URL 제외
          if (s.text.slice(Math.max(0, m.index - 5), m.index).includes("http")) continue;
        }
        const start = s.span.start + m.index;
        findings.push({
          ruleId: "TYP-03",
          message: `'${m[0]}' 대신 문장으로 풀어 쓰세요.`,
          span: { start, end: start + 1 },
          suggestion: "쌍점(:)이나 쌍반점(;) 대신 '~입니다', '~이 있습니다'처럼 문장으로 쓰세요.",
        });
      }
    }
    return findings;
  },
};
