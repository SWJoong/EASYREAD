import type { Rule, RuleFinding } from "../types.js";

// NUM-01 한글 수사: 한자어 수사(2자 이상) 또는 고유어 수사 어절을 아라비아 숫자로 바꾸도록 warning.
// 근거: 국내 지침(한국어 특화) · Inclusion Europe(숫자는 아라비아 숫자로).
// 단일 글자('이','삼')는 오탐이 커 제외. v0.1은 어절 정확 일치(조사 결합·복합어는 backlog).
const SINO = /^[영일이삼사오육칠팔구십백천만]{2,}$/;
const NATIVE = new Set(["열", "스물", "서른", "마흔", "쉰", "예순", "일흔", "여든", "아흔"]);

export const num01: Rule = {
  id: "NUM-01",
  group: "NUM",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        if (SINO.test(w.text) || NATIVE.has(w.text)) {
          findings.push({
            ruleId: "NUM-01",
            message: `'${w.text}'은(는) 한글로 쓴 숫자입니다. 아라비아 숫자로 쓰면 더 쉽습니다.`,
            span: w.span,
            suggestion: "예: 삼십 → 30",
          });
        }
      }
    }
    return findings;
  },
};
