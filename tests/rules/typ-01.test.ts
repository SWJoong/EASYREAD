import { evaluate } from "../../src/rules/index.js";
import { typ01 } from "../../src/rules/typ/index.js";

/**
 * TYP-01 — 풀어 쓰지 않은 기호 (자동 / 기본 warning). validation-checklist.md 참조.
 * 근거: Inclusion Europe(특수기호 대신 낱말) · guidelines §5('~'는 '부터/까지').
 *
 * 구현 계약 (Instance-U가 src/rules/typ/typ-01.ts로 구현):
 *  - 기호 집합 {※, ~, &, /} 각 출현마다 warning 1건. { ruleId:"TYP-01", span:(기호 위치) }
 *    severity 생략 → warning. 말로 풀어쓰기 제안('~'→'부터/까지', '&'→'그리고').
 *  - 문장부호(., ?, !)나 괄호는 대상 아님(TYP-02·03 소관).
 */
const run = (raw: string) => evaluate({ raw }, [typ01]).violations;

describe("TYP-01 기호", () => {
  it("TC-TYP-01-01: 물결표 '~'는 warning", () => {
    const v = run("회의는 3시~5시입니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("TYP-01");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-TYP-01-02: 앰퍼샌드 '&'를 탐지한다", () => {
    expect(run("사과 & 배를 샀습니다.")).toHaveLength(1);
  });

  it("TC-TYP-01-03: 기호가 없으면 통과", () => {
    expect(run("회의는 3시부터 5시까지입니다.")).toHaveLength(0);
  });

  it("TC-TYP-01-04: 빗금 '/'을 탐지한다", () => {
    expect(run("월/일 형식으로 적으세요.")).toHaveLength(1);
  });
});
