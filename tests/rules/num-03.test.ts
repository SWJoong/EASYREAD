import { evaluate } from "../../src/rules/index.js";
import { num03 } from "../../src/rules/num/index.js";

/**
 * NUM-03 — 상대적 날짜 표현 (자동 / 기본 warning). validation-checklist.md 참조.
 * 근거: Inclusion Europe(날짜는 분명하게) · 국내 지침(완전한 날짜 표기).
 *
 * 구현 계약 (Instance-U가 src/rules/num/num-03.ts로 구현):
 *  - 상대 날짜 한자어 목록 {익일, 명일, 작일, 금일, 금주, 차주, 전주, 익월, 차월, 전월, 금년, 익년}에 대해,
 *    각 어절 w가 그 중 하나로 **시작하면**(조사 결합 '금주에' 대응) finding 1건. 구체적 날짜 표기 제안.
 *    { ruleId:"NUM-03", span:w.span }  severity 생략 → warning.
 *  - '다음 날'·'4월 3일'처럼 이미 분명한 표현은 대상 아님.
 */
const run = (raw: string) => evaluate({ raw }, [num03]).violations;

describe("NUM-03 상대적 날짜", () => {
  it("TC-NUM-03-01: '익일'은 warning", () => {
    const v = run("익일 다시 오세요.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("NUM-03");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-NUM-03-02: 조사가 붙은 '금주에'도 탐지한다", () => {
    expect(run("금주에 신청하세요.")).toHaveLength(1);
  });

  it("TC-NUM-03-03: 구체적 날짜 '4월 3일'은 통과", () => {
    expect(run("4월 3일에 다시 오세요.")).toHaveLength(0);
  });

  it("TC-NUM-03-04: 이미 쉬운 '다음 날'은 대상 아님", () => {
    expect(run("다음 날 오세요.")).toHaveLength(0);
  });
});
