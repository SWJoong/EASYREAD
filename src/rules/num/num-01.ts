import type { Rule, RuleFinding } from "../types.js";

// NUM-01 한글 수사 표기: '삼십 일', '이백 원' 등 → 아라비아 숫자 제안. 자동(warning).
// 근거: Inclusion Europe #18 · 국내 지침(아라비아 숫자 사용).
const SINO_NUMERALS = /([일이삼사오육칠팔구십백천만억]{2,})\s*(일|원|명|개|건|회|시|분|호|층|번|월)/g;

export const num01: Rule = {
  id: "NUM-01",
  group: "NUM",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      SINO_NUMERALS.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = SINO_NUMERALS.exec(s.text)) !== null) {
        const start = s.span.start + m.index;
        findings.push({
          ruleId: "NUM-01",
          message: `'${m[0]}'을(를) 아라비아 숫자로 쓰면 읽기 쉽습니다.`,
          span: { start, end: start + m[0].length },
          suggestion: "한글 수사 대신 아라비아 숫자(1, 2, 3…)를 쓰세요.",
        });
      }
    }
    return findings;
  },
};
