import type { Rule, RuleFinding } from "../types.js";

// NUM-03 상대적 날짜 표현: '익일', '금주', '차주' 등 → 구체적 날짜 제안. 자동(warning).
// 근거: 국내 지침(날짜·시간은 완전하게).
// VOC-01의 difficult 사전에도 일부 있지만, NUM 관점에서 "완전한 날짜를 쓰라"는 별도 제안.
const RELATIVE_DATE_WORDS: ReadonlyMap<string, string> = new Map([
  ["익일", "다음 날(구체적 날짜)"],
  ["금일", "오늘(구체적 날짜)"],
  ["명일", "내일(구체적 날짜)"],
  ["금주", "이번 주(구체적 날짜)"],
  ["차주", "다음 주(구체적 날짜)"],
  ["금월", "이번 달(구체적 날짜)"],
  ["차월", "다음 달(구체적 날짜)"],
  ["전일", "하루 전(구체적 날짜)"],
  ["당일", "그 날(구체적 날짜)"],
  ["차기", "다음(구체적 시기)"],
]);

export const num03: Rule = {
  id: "NUM-03",
  group: "NUM",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const [word, suggestion] of RELATIVE_DATE_WORDS) {
        let pos = 0;
        while ((pos = s.text.indexOf(word, pos)) !== -1) {
          const start = s.span.start + pos;
          findings.push({
            ruleId: "NUM-03",
            message: `'${word}'은(는) 상대적 날짜입니다. 구체적인 날짜를 함께 쓰세요.`,
            span: { start, end: start + word.length },
            suggestion: `'${suggestion}'로 바꾸고, '4월 3일'처럼 정확한 날짜를 쓰세요.`,
          });
          pos += word.length;
        }
      }
    }
    return findings;
  },
};
