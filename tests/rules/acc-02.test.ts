import { evaluate } from "../../src/rules/index.js";
import { acc02 } from "../../src/rules/acc/index.js";

/**
 * ACC-02 — 금액/수량 불일치 (자동 / 기본 error). validation-checklist.md 참조.
 * 근거: 정확성 원칙(guidelines §7). requiresOriginal:true. 공유 추출기는 acc-01.test.ts 헤더 참조.
 *
 * 구현 계약 (Instance-U가 src/rules/acc/acc-02.ts로 구현):
 *  - extractAmounts(ctx.original.raw)의 각 금액/수량이 extractAmounts(ctx.raw)에 없으면 finding 1건(error).
 *    { ruleId:"ACC-02", ... } severity 생략 → error.
 *  - NUM-02 단순화(47.3% → 10명 중 5명)처럼 의도된 변경은 v0.1 범위 밖(원문 값 병기 판정은 backlog).
 */
const run = (raw: string, original: string) => evaluate({ raw, original }, [acc02]).violations;

describe("ACC-02 금액/수량 불일치", () => {
  it("TC-ACC-02-01: 원문 금액이 변환문에서 바뀌면 error", () => {
    const v = run("10만 원을 지원합니다.", "100만 원을 지원합니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("ACC-02");
    expect(v[0]?.severity).toBe("error");
  });

  it("TC-ACC-02-02: 금액이 보존되면 통과", () => {
    expect(run("100만 원을 드립니다.", "100만 원을 지원합니다.")).toHaveLength(0);
  });

  it("TC-ACC-02-03: 원문이 없으면 비활성(requiresOriginal)", () => {
    expect(evaluate({ raw: "10만 원을 지원합니다." }, [acc02]).violations).toHaveLength(0);
  });
});
