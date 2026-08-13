import { evaluate } from "../../src/rules/index.js";
import { acc04 } from "../../src/rules/acc/index.js";

/**
 * ACC-04 — 연락처/URL 불일치 (자동 / 기본 error). validation-checklist.md 참조.
 * 근거: 정확성 원칙(guidelines §7). requiresOriginal:true. 공유 추출기는 acc-01.test.ts 헤더 참조.
 *
 * 구현 계약 (Instance-U가 src/rules/acc/acc-04.ts로 구현):
 *  - extractContacts(ctx.original.raw)의 각 전화번호/URL이 extractContacts(ctx.raw)에 없으면 finding 1건(error).
 *    { ruleId:"ACC-04", ... } severity 생략 → error.
 *  - 전화: /\d{2,4}-\d{3,4}-\d{4}/, URL: http(s)://… 또는 www.…
 */
const run = (raw: string, original: string) => evaluate({ raw, original }, [acc04]).violations;

describe("ACC-04 연락처/URL 불일치", () => {
  it("TC-ACC-04-01: 원문 전화번호가 변환문에서 바뀌면 error", () => {
    const v = run("02-123-9999로 전화하세요.", "02-123-4567로 전화하세요.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("ACC-04");
    expect(v[0]?.severity).toBe("error");
  });

  it("TC-ACC-04-02: 연락처가 보존되면 통과", () => {
    expect(run("전화번호는 02-123-4567입니다.", "02-123-4567로 전화하세요.")).toHaveLength(0);
  });

  it("TC-ACC-04-03: 원문이 없으면 비활성(requiresOriginal)", () => {
    expect(evaluate({ raw: "02-123-9999로 전화하세요." }, [acc04]).violations).toHaveLength(0);
  });
});
