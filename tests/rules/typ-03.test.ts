import { evaluate } from "../../src/rules/index.js";
import { typ03 } from "../../src/rules/typ/index.js";

/**
 * TYP-03 — 쌍점/쌍반점 사용 (자동 / 기본 info). validation-checklist.md 참조.
 * 근거: 쉬운 언어 일반 원칙(문장부호 절제).
 *
 * 구현 계약 (Instance-U가 src/rules/typ/typ-03.ts로 구현):
 *  - ':'(쌍점)·';'(쌍반점) 출현마다 info 1건. { ruleId:"TYP-03", span:(기호 위치) }
 *    severity 생략 → info. 문장으로 풀어쓰기 제안.
 *  - 단, **숫자 사이의 ':'**(시각 '3:00')는 제외한다(오탐 방지).
 */
const run = (raw: string) => evaluate({ raw }, [typ03]).violations;

describe("TYP-03 쌍점/쌍반점", () => {
  it("TC-TYP-03-01: 쌍점 ':'은 info", () => {
    const v = run("준비물: 신분증과 도장.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("TYP-03");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-TYP-03-02: 쌍반점 ';'을 탐지한다", () => {
    expect(run("예; 사과와 배.")).toHaveLength(1);
  });

  it("TC-TYP-03-03: 쌍점·쌍반점이 없으면 통과", () => {
    expect(run("준비물은 신분증입니다.")).toHaveLength(0);
  });

  it("TC-TYP-03-04: 오탐 방지 — 시각의 '3:00'은 잡지 않는다", () => {
    expect(run("회의는 3:00에 시작합니다.")).toHaveLength(0);
  });
});
