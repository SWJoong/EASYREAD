import { evaluate } from "../../src/rules/index.js";
import { str03 } from "../../src/rules/str/index.js";

/**
 * STR-03 — 3개 이상 나열이 문장 안에 있음 (보조 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe #19(같은 주제 묶기) · guidelines §4(나열은 목록으로).
 *
 * 구현 계약 (Instance-U가 src/rules/str/str-03.ts로 구현):
 *  - 각 문장에서 나열 구분자(',' '·' '、') 개수가 2 이상이면(항목 3개 이상) 문장당 info 1건.
 *    { ruleId:"STR-03", span:(문장 span) }  severity 생략 → info. 글머리표 목록화 제안.
 *  - 보조(오탐 있음): 쉼표가 나열이 아닌 경우도 있어 warning이 아닌 info.
 */
const run = (raw: string) => evaluate({ raw }, [str03]).violations;

describe("STR-03 문장 내 나열", () => {
  it("TC-STR-03-01: 쉼표 2개(항목 3개)는 info", () => {
    const v = run("사과, 배, 감을 샀습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("STR-03");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-STR-03-02: 나열이 없으면 통과", () => {
    expect(run("사과와 배를 샀습니다.")).toHaveLength(0);
  });

  it("TC-STR-03-03: 쉼표 1개(항목 2개)는 통과(경계)", () => {
    expect(run("사과, 배를 샀습니다.")).toHaveLength(0);
  });

  it("TC-STR-03-04: 항목이 더 많아도 문장당 1건", () => {
    expect(run("빨강, 노랑, 초록, 파랑입니다.")).toHaveLength(1);
  });
});
