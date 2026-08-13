import { evaluate } from "../../src/rules/index.js";
import { voc03 } from "../../src/rules/voc/index.js";
import { makeDict } from "./voc-fixtures.js";

/**
 * VOC-03 — 전문용어/법령용어에 뜻풀이 없음 (보조 / 기본 warning). validation-checklist.md 참조.
 * 근거: Inclusion Europe #7(어려운 낱말은 설명) · guidelines §2(바꿀 수 없는 용어는 뜻풀이).
 *
 * 구현 계약 (Instance-U가 src/rules/voc/voc-03.ts로 구현):
 *  - 각 문장의 각 어절 w에 대해 ctx.dictionary.lookup(w.text) 조회.
 *  - 결과가 있고 category === "terminology" 인데 **같은 문장에 뜻풀이가 없으면** finding 1건:
 *      { ruleId:"VOC-03", span:w.span, message:(해당 용어 언급) }  // severity 생략 → warning
 *  - 뜻풀이 판정(보조): 같은 문장 raw에 다음 마커가 하나라도 있으면 "설명됨"으로 보고 넘어간다.
 *      ['이란', '라는 뜻', '뜻입니다', '뜻이', '설명', '('].
 *  - 매칭된 용어마다 1건(VOC-01처럼 어절 단위). v0.1은 **어절 정확 일치**만(조사 결합 '임의가입의'는 미탐 — backlog).
 *  - "terminology"가 아닌 카테고리는 VOC-03이 관여하지 않는다(각 카테고리 전담 규칙 존재).
 */

const dict = makeDict([
  { word: "임의가입", category: "terminology", explanation: "원하면 가입" },
  { word: "수급자격", category: "terminology" },
  { word: "상기", category: "difficult", alternatives: ["위에 적은"] },
]);
const run = (raw: string) => evaluate({ raw, dictionary: dict }, [voc03]).violations;

describe("VOC-03 전문용어 뜻풀이 없음", () => {
  it("TC-VOC-03-01: 뜻풀이 없는 전문용어는 warning", () => {
    const v = run("임의가입 신청을 받습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-03");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-VOC-03-02: 같은 문장에 뜻풀이('~뜻입니다')가 있으면 통과", () => {
    expect(run("임의가입 제도는 원하면 가입한다는 뜻입니다.")).toHaveLength(0);
  });

  it("TC-VOC-03-03: 괄호 풀이가 있으면 통과", () => {
    expect(run("임의가입 (원하면 가입하는 제도) 신청을 받습니다.")).toHaveLength(0);
  });

  it("TC-VOC-03-04: 사전에 없는 일상어는 통과", () => {
    expect(run("학교에 갑니다.")).toHaveLength(0);
  });

  it("TC-VOC-03-05: terminology가 아닌 카테고리(difficult)는 VOC-03이 잡지 않는다", () => {
    expect(run("상기 내용을 봅니다.")).toHaveLength(0);
  });

  it("TC-VOC-03-06: 풀이 없는 전문용어 여러 개는 각각 보고한다", () => {
    const v = run("임의가입 수급자격 안내입니다.");
    expect(v).toHaveLength(2);
    expect(v.every((x) => x.ruleId === "VOC-03")).toBe(true);
  });

  it("TC-VOC-03-07: v0.1은 정확 일치만 — 조사가 붙은 '임의가입의'는 잡지 않는다(backlog)", () => {
    expect(run("임의가입의 조건을 봅니다.")).toHaveLength(0);
  });
});
