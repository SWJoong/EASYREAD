import { rules, validate } from "../../src/rules/index.js";

describe("registry 통합", () => {
  it("TC-CORE-13: registry에 SEN·VOC 규칙군이 정적으로 등록되어 있다", () => {
    // VOC-03~06(T-07 VOC군 마무리)까지 등록된 상태를 기대한다.
    // U는 vocRules에 voc03~06을 번호순으로 추가하면 이 스냅샷이 green이 된다(테스트 미변경).
    expect(rules.map((r) => r.id)).toEqual([
      "SEN-01", "SEN-02", "SEN-03", "SEN-04", "SEN-05", "SEN-07",
      "VOC-01", "VOC-02", "VOC-03", "VOC-04", "VOC-05", "VOC-06",
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
