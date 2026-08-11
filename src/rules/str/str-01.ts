import type { Rule, RuleFinding } from "../types.js";

// STR-01 행동/결론이 글 앞부분에 없음: 수동 규칙이므로 점검 질문으로 안내. info.
// 근거: Inclusion Europe #13(중요한 것 먼저) · 국내 지침(행동/결론 앞).
export const str01: Rule = {
  id: "STR-01",
  group: "STR",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    // 텍스트에 5문장 이상이면 구조 점검 질문을 1회 발행
    const first = ctx.sentences[0];
    if (ctx.sentences.length >= 5 && first) {
      findings.push({
        ruleId: "STR-01",
        message: "글이 길어요. 독자가 해야 할 일이나 결론이 앞쪽에 있는지 확인하세요.",
        span: first.span,
        suggestion: "가장 중요한 행동이나 결론을 첫 문장 근처에 두세요.",
      });
    }
    return findings;
  },
};
