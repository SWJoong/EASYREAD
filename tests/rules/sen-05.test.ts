import { evaluate } from "../../src/rules/index.js";
import { sen05 } from "../../src/rules/sen/index.js";

const run = (raw: string) => evaluate({ raw }, [sen05]).violations;

describe("SEN-05 여러 정보 나열", () => {
  it("TC-SEN-05-01: 쉼표로 3개 이상 나열하면 info", () => {
    const v = run("사과, 배, 감을 샀습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-05");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-SEN-05-02: '및'과 쉼표 혼합 나열을 탐지한다", () => {
    expect(run("연필, 지우개 및 공책을 준비하세요.")).toHaveLength(1);
  });

  it("TC-SEN-05-03: 가운뎃점 나열을 탐지한다", () => {
    expect(run("사과·배·감")).toHaveLength(1);
  });

  it("TC-SEN-05-04: 두 항목(구분자 1개)은 통과", () => {
    expect(run("사과와 배를 샀습니다.")).toHaveLength(0);
  });

  it("TC-SEN-05-05: 천 단위 콤마 숫자는 오탐하지 않는다", () => {
    expect(run("올해 인구는 1,000,000명입니다.")).toHaveLength(0);
  });
});
