import { evaluate } from "../../src/rules/index.js";
import { sen03 } from "../../src/rules/sen/index.js";

const run = (raw: string) => evaluate({ raw }, [sen03]).violations;

describe("SEN-03 피동 표현", () => {
  it("TC-SEN-03-01: '-되다' 피동은 warning", () => {
    const v = run("지원금이 지급됩니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-03");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-SEN-03-02: '-어지다' 피동을 탐지한다", () => {
    expect(run("환경이 좋아졌습니다.")).toHaveLength(1);
  });

  it("TC-SEN-03-03: '-당하다'는 탐지하고 '담당'은 오탐 제외", () => {
    expect(run("사기를 당했습니다.")).toHaveLength(1);
    expect(run("제가 담당합니다.")).toHaveLength(0);
  });

  it("TC-SEN-03-04: 능동 표현은 통과", () => {
    expect(run("구청이 지원금을 줍니다.")).toHaveLength(0);
  });

  it("TC-SEN-03-05: span이 피동 표현 위치를 가리킨다", () => {
    const raw = "지원금이 지급됩니다.";
    const seg = run(raw)[0];
    expect(raw.slice(seg?.span.start, seg?.span.end)).toContain("됩니다");
  });
});
