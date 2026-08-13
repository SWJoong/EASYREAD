import type { Rule, RuleFinding } from "../types.js";

// NUM-03 상대적 날짜: '익일·금주·전월'처럼 기준이 불분명한 상대 날짜 어절을 구체적 날짜로 바꾸도록 warning.
// 근거: Inclusion Europe(날짜는 분명하게) · 국내 지침(완전한 날짜). 조사 결합('금주에')은 startsWith로 대응.
const RELATIVE = ["익일", "명일", "작일", "금일", "금주", "차주", "전주", "익월", "차월", "전월", "금년", "익년"];

export const num03: Rule = {
  id: "NUM-03",
  group: "NUM",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        if (RELATIVE.some((r) => w.text.startsWith(r))) {
          findings.push({
            ruleId: "NUM-03",
            message: `'${w.text}'은(는) 기준이 불분명한 날짜입니다. 정확한 날짜(예: 4월 3일)로 쓰세요.`,
            span: w.span,
          });
        }
      }
    }
    return findings;
  },
};
