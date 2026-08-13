import { rules, validate } from "../../src/rules/index.js";

describe("registry 통합", () => {
  it("TC-CORE-13: registry에 SEN·VOC·NUM·STR·TYP 규칙군이 정적으로 등록되어 있다", () => {
    // T-08(NUM·STR·TYP)까지 등록된 상태를 기대한다. registry = [...sen, ...voc, ...num, ...str, ...typ].
    // U는 numRules=[num01~04]·strRules=[str02,str03]·typRules=[typ01~03]를 만들어 registry에 이으면
    // 이 스냅샷이 green이 된다(테스트 미변경). STR-01·STR-04는 '수동' 항목이라 등록하지 않는다.
    expect(rules.map((r) => r.id)).toEqual([
      "SEN-01", "SEN-02", "SEN-03", "SEN-04", "SEN-05", "SEN-07",
      "VOC-01", "VOC-02", "VOC-03", "VOC-04", "VOC-05", "VOC-06",
      "NUM-01", "NUM-02", "NUM-03", "NUM-04",
      "STR-02", "STR-03",
      "TYP-01", "TYP-02", "TYP-03",
    ]);
  });

  it("TC-CORE-14: validate()가 등록된 규칙으로 리포트를 만든다", () => {
    const report = validate({ raw: "신청하지 않으면 받을 수 없습니다." });
    expect(report.verdict).toBe("fail"); // SEN-04(이중 부정)=error
    expect(report.summary.byGroup.SEN ?? 0).toBeGreaterThanOrEqual(1);
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(true);
  });

  it("TC-CORE-15: excludeRules로 특정 규칙을 끈다", () => {
    const report = validate({ raw: "신청하지 않으면 받을 수 없습니다.", config: { excludeRules: ["SEN-04"] } });
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(false);
  });
});
