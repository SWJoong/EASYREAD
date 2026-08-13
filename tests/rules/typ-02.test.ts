import { evaluate } from "../../src/rules/index.js";
import { typ02 } from "../../src/rules/typ/index.js";

/**
 * TYP-02 — 괄호 남용 (자동 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe §2(괄호보다 문장으로 설명) · guidelines §5.
 *
 * 구현 계약 (Instance-U가 src/rules/typ/typ-02.ts로 구현):
 *  - 각 문장에서 여는 괄호('(') 개수가 2 이상이면 문장당 info 1건.
 *    { ruleId:"TYP-02", span:(문장 span) }  severity 생략 → info. 괄호 속 정보는 문장으로 풀기 제안.
 *  - 문장당 1개 괄호는 통과.
 */
const run = (raw: string) => evaluate({ raw }, [typ02]).violations;

describe("TYP-02 괄호 남용", () => {
  it("TC-TYP-02-01: 문장에 괄호 2개는 info", () => {
    const v = run("매장(가게)과 지점(분점)을 봅니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("TYP-02");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-TYP-02-02: 괄호 1개는 통과", () => {
    expect(run("매장(가게)을 봅니다.")).toHaveLength(0);
  });

  it("TC-TYP-02-03: 괄호가 없으면 통과", () => {
    expect(run("매장을 봅니다.")).toHaveLength(0);
  });

  it("TC-TYP-02-04: 문장별로 판정한다", () => {
    // 두 문장 모두 괄호 2개 → 각각 1건
    expect(run("매장(가게)과 지점(분점)입니다. 본사(본부)와 지사(지부)입니다.")).toHaveLength(2);
  });
});
