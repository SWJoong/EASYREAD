import { evaluate } from "../../src/rules/index.js";
import { num01 } from "../../src/rules/num/index.js";

/**
 * NUM-01 — 한글 수사 표기 (자동 / 기본 warning). validation-checklist.md 참조.
 * 근거: 국내 지침(한국어 특화) · Inclusion Europe(숫자는 아라비아 숫자로).
 *
 * 구현 계약 (Instance-U가 src/rules/num/num-01.ts로 구현):
 *  - 각 문장의 각 어절 w가 한글 수사이면 finding 1건(아라비아 숫자 제안):
 *      (a) 한자어 수사: /^[영일이삼사오육칠팔구십백천만]{2,}$/  (단일 글자는 오탐이 커 제외),
 *      (b) 고유어 수사: {열, 스물, 서른, 마흔, 쉰, 예순, 일흔, 여든, 아흔} 중 하나.
 *    { ruleId:"NUM-01", span:w.span, ... }  severity 생략 → warning.
 *  - 이미 아라비아 숫자('30')는 대상 아님. v0.1은 어절 정확 일치(조사 결합·복합어는 backlog).
 */
const run = (raw: string) => evaluate({ raw }, [num01]).violations;

describe("NUM-01 한글 수사", () => {
  it("TC-NUM-01-01: 한자어 수사 '삼십'은 warning", () => {
    const v = run("삼십 명이 왔습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("NUM-01");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-NUM-01-02: 고유어 수사 '서른'을 탐지한다", () => {
    expect(run("서른 명이 왔습니다.")).toHaveLength(1);
  });

  it("TC-NUM-01-03: 아라비아 숫자 '30명'은 통과", () => {
    expect(run("30명이 왔습니다.")).toHaveLength(0);
  });

  it("TC-NUM-01-04: 오탐 방지 — 단일 글자 '이'·수사 아닌 '삼계탕'은 잡지 않는다", () => {
    expect(run("이 사람이 삼계탕을 먹습니다.")).toHaveLength(0);
  });

  it("TC-NUM-01-05: 날짜 수사 '삼십일'도 탐지한다", () => {
    expect(run("삼십일 동안 쉽니다.")).toHaveLength(1);
  });
});
