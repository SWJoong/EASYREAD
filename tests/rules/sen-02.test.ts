import { evaluate } from "../../src/rules/index.js";
import { sen02 } from "../../src/rules/sen/index.js";

const run = (raw: string) => evaluate({ raw }, [sen02]).violations;

describe("SEN-02 복문", () => {
  it("TC-SEN-02-01: '-고'로 이어진 복문은 warning", () => {
    const v = run("밥을 먹고 학교에 갔습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-02");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-SEN-02-02: '-지만' 복문을 탐지한다", () => {
    expect(run("작지만 튼튼합니다.")).toHaveLength(1);
  });

  it("TC-SEN-02-03: '-는데' 복문을 탐지한다", () => {
    expect(run("비가 왔는데 우산이 없었습니다.")).toHaveLength(1);
  });

  it("TC-SEN-02-04: 단문은 통과", () => {
    expect(run("학교에 갔습니다.")).toHaveLength(0);
  });

  it("TC-SEN-02-05: 접속부사 '그리고/하지만'으로 시작하는 문장은 오탐하지 않는다", () => {
    expect(run("그리고 학교에 갔습니다.")).toHaveLength(0);
    expect(run("하지만 갔습니다.")).toHaveLength(0);
  });

  it("TC-SEN-02-06: '말고'(비교)는 복문이 아니다", () => {
    expect(run("사과 말고 배를 사세요.")).toHaveLength(0);
  });
});
