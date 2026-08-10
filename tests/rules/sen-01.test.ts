import { evaluate } from "../../src/rules/index.js";
import type { RuleConfigInput } from "../../src/rules/index.js";
import { sen01 } from "../../src/rules/sen/index.js";

const run = (raw: string, config?: RuleConfigInput) => evaluate({ raw, config }, [sen01]).violations;
/** n어절 문장 생성. */
const words = (n: number) => `${Array.from({ length: n }, () => "말").join(" ")}.`;

describe("SEN-01 문장 길이", () => {
  it("TC-SEN-01-01: 16어절 문장은 error", () => {
    const v = run(words(16));
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-01");
    expect(v[0]?.severity).toBe("error");
    expect(v[0]?.message).toContain("16");
  });

  it("TC-SEN-01-02: 12어절 문장은 warning", () => {
    expect(run(words(12))[0]?.severity).toBe("warning");
  });

  it("TC-SEN-01-03: 10어절 이하 문장은 통과", () => {
    expect(run(words(10))).toHaveLength(0);
    expect(run(words(8))).toHaveLength(0);
  });

  it("TC-SEN-01-04: 11어절은 임계값 초과로 warning", () => {
    expect(run(words(11))[0]?.severity).toBe("warning");
  });

  it("TC-SEN-01-05: 설정으로 임계값을 조정한다", () => {
    expect(run(words(6), { maxWordsWarning: 5, maxWordsError: 7 })[0]?.severity).toBe("warning");
    expect(run(words(8), { maxWordsWarning: 5, maxWordsError: 7 })[0]?.severity).toBe("error");
  });
});
