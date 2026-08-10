import type { Rule, RuleFinding } from "../types.js";

// SEN-04 이중 부정: 한 문장에 부정 표현 2회 이상. 자동(error).
// 근거: Inclusion Europe #16(부정문보다 긍정문).
// 절 단위 부정 마커('-지 않/못/마', '없', '아니')만 센다 — '안'/'못' 단독은 '안전/안내'
// 같은 오탐이 커서 제외한다(정밀도 우선).
const NEGATION_PATTERNS: readonly RegExp[] = [/지\s*않/g, /지\s*못/g, /지\s*마/g, /없/g, /아니/g];

export const sen04: Rule = {
  id: "SEN-04",
  group: "SEN",
  defaultSeverity: "error",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      let count = 0;
      for (const pattern of NEGATION_PATTERNS) {
        const matches = s.text.match(pattern);
        if (matches !== null) count += matches.length;
      }
      if (count >= 2) {
        findings.push({
          ruleId: "SEN-04",
          message: "부정 표현이 여러 번 있습니다(이중 부정). 긍정문으로 바꾸세요.",
          span: s.span,
          suggestion: "예: '신청하지 않으면 받을 수 없습니다' → '신청하면 받을 수 있습니다'.",
        });
      }
    }
    return findings;
  },
};
