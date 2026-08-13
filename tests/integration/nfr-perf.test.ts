import { validate } from "../../src/rules/index.js";

/**
 * T-11 · 성능 (NFR-02): 10,000자 문서 검증이 1초 이내(로컬·CI 공통 여유 목표).
 * 규칙 엔진(validate)을 직접 측정한다. 위반이 많은 최악치에 가깝게(문단마다 이중부정·명사화·날짜 등)
 * 구성해 상한을 잡는다. MAX_VIOLATIONS(200) 절단은 summary엔 전체 반영·배열만 절단이라 부하 유지.
 */
function makeDoc(minChars: number): string {
  const para =
    "신청하지 않으면 받을 수 없습니다. 구비서류를 제출하여 주시기 바랍니다. " +
    "2026년 3월 2일까지가 신청 기간입니다. 자세한 것은 담당자에게 문의하시기 바랍니다.\n\n";
  let doc = "";
  while ([...doc].length < minChars) doc += para;
  return doc;
}

describe("성능 (NFR-02)", () => {
  it("TC-PERF-01: 10,000자 문서 검증이 1초 이내", () => {
    const doc = makeDoc(10_000);
    expect([...doc].length).toBeGreaterThanOrEqual(10_000);

    const start = performance.now();
    const report = validate({ raw: doc });
    const elapsed = performance.now() - start;

    expect(report.verdict).toBeDefined(); // 실제로 처리됐음을 확인(최적화로 건너뛰지 않음)
    expect(elapsed).toBeLessThan(1000);
  });

  it("TC-PERF-02: 원문 대조(ACC 활성) 포함 10,000자도 1초 이내", () => {
    const doc = makeDoc(10_000);
    const original = makeDoc(10_000);

    const start = performance.now();
    const report = validate({ raw: doc, original });
    const elapsed = performance.now() - start;

    expect(report.verdict).toBeDefined();
    expect(elapsed).toBeLessThan(1000);
  });
});
