import type { Rule, RuleFinding } from "../types.js";

// SEN-05 한 문장에 여러 정보: 병렬 나열 3개 이상(구분자 2개 이상). 보조(info).
// 근거: Inclusion Europe(한 문장에 한 가지 생각) · 국내 지침 내용조직화.
// 천 단위 콤마('1,000,000')는 나열이 아니므로 숫자 사이 콤마를 먼저 제거한다.
const ENUM_MARKS = /[,，、·]/g;

export const sen05: Rule = {
  id: "SEN-05",
  group: "SEN",
  defaultSeverity: "info",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const withoutNumberCommas = s.text.replace(/(?<=\d),(?=\d)/g, "");
      const marks = withoutNumberCommas.match(ENUM_MARKS)?.length ?? 0;
      const ands = withoutNumberCommas.match(/및/g)?.length ?? 0;
      if (marks + ands >= 2) {
        findings.push({
          ruleId: "SEN-05",
          message: "한 문장에 여러 가지가 나열되어 있습니다. 목록으로 나누면 읽기 쉽습니다.",
          span: s.span,
          suggestion: "세 가지 이상은 글머리표 목록으로 만드세요.",
        });
      }
    }
    return findings;
  },
};
