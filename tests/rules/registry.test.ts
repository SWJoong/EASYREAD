import { rules, validate } from "../../src/rules/index.js";

describe("registry 통합", () => {
  it("TC-CORE-13: registry에 SEN 규칙군이 정적으로 등록되어 있다", () => {
    expect(rules.map((r) => r.id)).toEqual([
      "SEN-01", "SEN-02", "SEN-03", "SEN-04", "SEN-05",
      "VOC-01", "VOC-02",
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
