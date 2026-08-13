import { evaluate } from "../../src/rules/index.js";
import { num04 } from "../../src/rules/num/index.js";

/**
 * NUM-04 — 읽기 어려운 큰 수 표기 (자동 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe #13(큰 수 지양) · 국내 지침(읽는 방식대로 만/억 단위).
 *
 * 구현 계약 (Instance-U가 src/rules/num/num-04.ts로 구현):
 *  - 문장 텍스트에서 천단위 콤마 숫자 패턴 /\d{1,3}(,\d{3})+/ 매치마다 info 1건.
 *    { ruleId:"NUM-04", span:(매치 구간) }  severity 생략 → info. '100만 원' 식 제안.
 *  - 콤마 없는 '1000'은 대상 아님(끊어 읽기 부담이 낮음). 소수점 비율은 NUM-02 소관.
 */
const run = (raw: string) => evaluate({ raw }, [num04]).violations;

describe("NUM-04 큰 수 표기", () => {
  it("TC-NUM-04-01: 콤마 큰 수 '1,000,000'은 info", () => {
    const v = run("1,000,000원을 냅니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("NUM-04");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-NUM-04-02: '100만 원'은 통과", () => {
    expect(run("100만 원을 냅니다.")).toHaveLength(0);
  });

  it("TC-NUM-04-03: 콤마 없는 '1000'은 대상 아님", () => {
    expect(run("1000원을 냅니다.")).toHaveLength(0);
  });

  it("TC-NUM-04-04: 콤마 큰 수 여러 개는 각각 보고한다", () => {
    expect(run("1,234명과 5,678명입니다.")).toHaveLength(2);
  });
});
