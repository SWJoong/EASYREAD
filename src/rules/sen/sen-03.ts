import type { Rule, RuleFinding } from "../types.js";

// SEN-03 피동 표현: '-되다', '-어지다', '-당하다' 등. 보조(패턴 매칭 → warning).
// 근거: Inclusion Europe #17(능동태 사용).
// '담당하다'는 '당하다' 오탐이 되지 않게 (?<!담)으로 제외한다.
const PASSIVE_PATTERNS: readonly RegExp[] = [
  /(되어|되었|되는|되고|되며|된다|됩니다|됐|돼서|돼요)/g,
  /(아|어|여)(지다|집니다|졌|지는|지고|지며|져서|져요)/g,
  /(?<!담)당(하|했|한|할|해|합니다)/g,
];

export const sen03: Rule = {
  id: "SEN-03",
  group: "SEN",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const pattern of PASSIVE_PATTERNS) {
        pattern.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = pattern.exec(s.text)) !== null) {
          const start = s.span.start + m.index;
          findings.push({
            ruleId: "SEN-03",
            message: "피동 표현입니다. 누가 하는지 드러내는 능동 표현이 더 쉽습니다.",
            span: { start, end: start + m[0].length },
            suggestion: "능동태로 바꿔 보세요. 예: '지급됩니다' → '구청이 줍니다'.",
          });
        }
      }
    }
    return findings;
  },
};
