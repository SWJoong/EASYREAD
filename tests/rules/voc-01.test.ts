import { evaluate } from "../../src/rules/index.js";
import { voc01 } from "../../src/rules/voc/index.js";
import { makeDict } from "./voc-fixtures.js";

/**
 * VOC-01 — 어려운 한자어 (자동 / 기본 warning). validation-checklist.md 참조.
 *
 * 구현 계약 (Instance-U가 src/rules/voc/voc-01.ts로 구현):
 *  - 각 문장의 각 어절 w에 대해 ctx.dictionary.lookup(w.text) 조회.
 *  - 결과가 있고 category === "difficult" 이면 finding 1건 방출:
 *      { ruleId:"VOC-01", span:w.span, message:(해당 어절 언급), suggestion:alternatives.join(", ") }
 *    severity는 생략 → 엔진이 defaultSeverity "warning"으로 채운다.
 *  - v0.1은 **어절 정확 일치**만 판정한다(dictionary.lookup 자체가 정확 일치).
 *    조사가 붙은 형태('상기의')·부분 일치는 T-08 사전 helper로 확장(backlog).
 *  - "difficult"가 아닌 카테고리는 VOC-01이 관여하지 않는다(각 카테고리는 전담 규칙이 있음).
 */

const dict = makeDict([
  { word: "상기", category: "difficult", alternatives: ["위에 적은", "앞에서 말한"] },
  { word: "구비", category: "difficult", alternatives: ["갖춤", "준비"] },
  { word: "가이드라인", category: "loanword", alternatives: ["지침"] },
]);
const run = (raw: string) => evaluate({ raw, dictionary: dict }, [voc01]).violations;

describe("VOC-01 어려운 한자어", () => {
  it("TC-VOC-01-01: 사전의 difficult 어절은 warning + 대체어 제안", () => {
    const v = run("상기 내용을 확인합니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-01");
    expect(v[0]?.severity).toBe("warning");
    expect(v[0]?.suggestion).toContain("위에 적은");
  });

  it("TC-VOC-01-02: 사전에 없는 쉬운 말은 통과", () => {
    expect(run("오늘 학교에 갑니다.")).toHaveLength(0);
  });

  it("TC-VOC-01-03: difficult가 아닌 카테고리(loanword)는 VOC-01이 잡지 않는다", () => {
    expect(run("가이드라인 문서를 봅니다.")).toHaveLength(0);
  });

  it("TC-VOC-01-04: 여러 개의 difficult 어절은 각각 보고한다", () => {
    const v = run("상기 서류를 구비 하세요.");
    expect(v).toHaveLength(2);
    expect(v.map((x) => x.ruleId)).toEqual(["VOC-01", "VOC-01"]);
  });

  it("TC-VOC-01-05: v0.1은 정확 일치만 — 조사가 붙은 '상기의'는 잡지 않는다(T-08 backlog)", () => {
    expect(run("상기의 내용을 봅니다.")).toHaveLength(0);
  });
});
