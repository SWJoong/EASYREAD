import { evaluate } from "../../src/rules/index.js";
import { sen04 } from "../../src/rules/sen/index.js";

const run = (raw: string) => evaluate({ raw }, [sen04]).violations;

describe("SEN-04 이중 부정", () => {
  it("TC-SEN-04-01: 이중 부정은 error", () => {
    const v = run("신청하지 않으면 받을 수 없습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-04");
    expect(v[0]?.severity).toBe("error");
  });

  it("TC-SEN-04-02: 단일 부정은 통과", () => {
    expect(run("받을 수 없습니다.")).toHaveLength(0);
    expect(run("신청하지 않았습니다.")).toHaveLength(0);
  });

  it("TC-SEN-04-03: 부정이 없으면 통과 ('안전/안내' 오탐 방지)", () => {
    expect(run("안전한 곳으로 가세요.")).toHaveLength(0);
    expect(run("안내를 받으세요.")).toHaveLength(0);
  });
});
