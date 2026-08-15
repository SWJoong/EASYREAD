import { evaluate } from "../../src/rules/index.js";
import { acc03 } from "../../src/rules/acc/index.js";

/**
 * ACC-03 — 기관명/고유명사 누락 (보조 / 기본 warning). validation-checklist.md 참조.
 * 근거: 정확성 원칙(guidelines §7). requiresOriginal:true. 공유 추출기는 acc-01.test.ts 헤더 참조.
 *
 * 구현 계약 (Instance-U가 src/rules/acc/acc-03.ts로 구현):
 *  - extractProperNouns(ctx.original.raw)의 각 고유명사 후보가 변환문(ctx.raw)에 없으면 finding 1건(warning).
 *    { ruleId:"ACC-03", ... } severity 생략 → warning. 보조(오탐 있음) → error가 아닌 warning.
 *  - 고유명사 후보(휴리스틱): …공단/공사/청/부/원/센터/위원회/구청/시청 등 기관 접미 어절.
 */
const run = (raw: string, original: string) => evaluate({ raw, original }, [acc03]).violations;

describe("ACC-03 기관명 누락", () => {
  it("TC-ACC-03-01: 원문 기관명이 변환문에서 빠지면 warning", () => {
    const v = run("공단에 문의하세요.", "국민연금공단에 문의하세요.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("ACC-03");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-ACC-03-02: 기관명이 보존되면 통과", () => {
    expect(run("국민연금공단에 전화하세요.", "국민연금공단에 문의하세요.")).toHaveLength(0);
  });

  it("TC-ACC-03-03: 원문이 없으면 비활성(requiresOriginal)", () => {
    expect(evaluate({ raw: "공단에 문의하세요." }, [acc03]).violations).toHaveLength(0);
  });

  it("TC-ACC-03-04: 흔한 명사(모집인원·일부)를 기관명으로 오인하지 않는다", () => {
    // '원'·'부'로 끝나는 일반 명사 과매칭 방지(파일럿 오탐).
    expect(run("사람을 뽑습니다.", "모집인원은 일부입니다.")).toHaveLength(0);
  });

  it("TC-ACC-03-05: 가운뎃점 압축표기('시·군·구청')는 기관명 후보에서 제외", () => {
    // 풀어쓴 '시청·군청·구청'이 있어도 압축표기 원형이 없다고 오탐하던 문제(파일럿 오탐).
    expect(run("시청·군청·구청에 갑니다.", "시·군·구청에 문의하세요.")).toHaveLength(0);
  });

  it("TC-ACC-03-06: 실제 기관명(경찰청)이 빠지면 여전히 warning(과소탐지 방지)", () => {
    const v = run("기관에 문의하세요.", "경찰청에 문의하세요.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("ACC-03");
  });
});
