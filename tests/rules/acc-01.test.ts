import { evaluate } from "../../src/rules/index.js";
import { acc01 } from "../../src/rules/acc/index.js";

/**
 * ACC-01 — 날짜/시간 불일치 (자동 / 기본 error). validation-checklist.md 참조.
 * 근거: 정확성 원칙(guidelines §7) · ISO 24495(정확·사용성). ACC군은 requiresOriginal:true —
 *   원문(original)이 주어졌을 때만 활성화된다(getActiveRules가 필터).
 *
 * ── 공유 추출기 인터페이스 (W 정의 · Instance-U가 src/text/extractors.ts로 구현) ──
 *   export function extractDates(text: string): string[];       // "3월 2일","2026년","3시" 등 정규화 토큰
 *   export function extractAmounts(text: string): string[];     // "100만 원","5명","1,000원" 등 숫자+단위
 *   export function extractContacts(text: string): string[];    // 전화 \d{2,4}-\d{3,4}-\d{4} · URL
 *   export function extractProperNouns(text: string): string[]; // 기관명 후보(…공단/청/부/원/센터/위원회 등)
 *   비교 방향: **원문에 있으나 변환문에 없는 값 = 사실 누락/왜곡** → 규칙별 심각도로 보고.
 *
 * ACC-01 구현 계약 (Instance-U가 src/rules/acc/acc-01.ts로 구현, requiresOriginal:true):
 *  - extractDates(ctx.original.raw)의 각 날짜가 extractDates(ctx.raw)에 없으면 finding 1건(error).
 *    { ruleId:"ACC-01", ... } severity 생략 → error. (변환문이 요일 등으로 보강해도 원문 날짜가 남아있으면 통과)
 */
const run = (raw: string, original: string) => evaluate({ raw, original }, [acc01]).violations;

describe("ACC-01 날짜/시간 불일치", () => {
  it("TC-ACC-01-01: 원문 날짜가 변환문에서 바뀌면 error", () => {
    const v = run("신청은 3월 5일까지입니다.", "신청은 3월 2일까지입니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("ACC-01");
    expect(v[0]?.severity).toBe("error");
  });

  it("TC-ACC-01-02: 날짜가 보존되면 통과", () => {
    expect(run("3월 2일까지 신청하세요.", "신청은 3월 2일까지입니다.")).toHaveLength(0);
  });

  it("TC-ACC-01-03: 원문이 없으면 ACC 규칙은 비활성(requiresOriginal)", () => {
    expect(evaluate({ raw: "3월 5일까지입니다." }, [acc01]).violations).toHaveLength(0);
  });

  it("TC-ACC-01-04: 요일 등으로 보강해도 원문 날짜가 남아있으면 통과", () => {
    expect(run("3월 2일 토요일까지 신청하세요.", "신청은 3월 2일까지입니다.")).toHaveLength(0);
  });

  it("TC-ACC-01-05: '주 5일'(근무 빈도)의 '5일'을 날짜로 오인하지 않는다", () => {
    // 원문은 '주 5일', 변환문은 요일로 풀어써 '5일'이 없음.
    // '5일'을 날짜로 보면 "원문 날짜 5일이 없다"는 거짓 error가 났었다(파일럿 오탐).
    expect(run("월요일부터 금요일까지 일해요.", "주 5일 근무합니다.")).toHaveLength(0);
  });

  it("TC-ACC-01-06: '주'가 앞에 없는 독립 '5일'은 여전히 날짜로 본다(과소탐지 방지)", () => {
    const v = run("신청 마감입니다.", "5일까지 신청하세요.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("ACC-01");
  });
});
