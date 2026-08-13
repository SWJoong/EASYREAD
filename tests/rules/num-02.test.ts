import { evaluate } from "../../src/rules/index.js";
import { num02 } from "../../src/rules/num/index.js";

/**
 * NUM-02 — 복잡한 비율/통계 (자동 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe #13(백분율 지양, '10명 중 N명').
 *
 * 구현 계약 (Instance-U가 src/rules/num/num-02.ts로 구현):
 *  - 문장 텍스트에서 소수점 백분율 패턴 /\d+\.\d+\s*%/ 매치마다 info 1건.
 *    { ruleId:"NUM-02", span:(매치 구간) }  severity 생략 → info. "10명 중 N명" 식 제안.
 *  - 정수 백분율('50%')은 v0.1 대상 아님(소수점 비율에 한정). 큰 수 콤마는 NUM-04 소관.
 */
const run = (raw: string) => evaluate({ raw }, [num02]).violations;

describe("NUM-02 복잡한 비율", () => {
  it("TC-NUM-02-01: 소수점 백분율 '47.3%'는 info", () => {
    const v = run("응답자의 47.3%가 찬성했습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("NUM-02");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-NUM-02-02: 백분율이 없으면 통과", () => {
    expect(run("응답자의 절반이 찬성했습니다.")).toHaveLength(0);
  });

  it("TC-NUM-02-03: 정수 백분율 '50%'는 v0.1 대상 아님", () => {
    expect(run("50%가 찬성했습니다.")).toHaveLength(0);
  });

  it("TC-NUM-02-04: 소수점 백분율 여러 개는 각각 보고한다", () => {
    expect(run("47.3%와 12.5%입니다.")).toHaveLength(2);
  });
});
