import { evaluate } from "../../src/rules/index.js";
import { voc04 } from "../../src/rules/voc/index.js";
import { makeDict } from "./voc-fixtures.js";

/**
 * VOC-04 — 추상어/관용구/비유 표현 (보조 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe #10(은유·비유 금지) · guidelines §2(추상어·비유·관용구를 피한다).
 *
 * 구현 계약 (Instance-U가 src/rules/voc/voc-04.ts로 구현 — VOC-01 패턴):
 *  - 각 문장의 각 어절 w에 대해 ctx.dictionary.lookup(w.text) 조회.
 *  - 결과가 있고 category === "idiom" 이면 finding 1건:
 *      { ruleId:"VOC-04", span:w.span, message:(구체적 행동으로 풀어쓰기 권유) }
 *    severity 생략 → 엔진이 defaultSeverity "info"로 채운다.
 *  - 매칭된 어절마다 1건. v0.1은 **어절 정확 일치**만(조사 결합 '활성화를'은 미탐 — backlog).
 *    다어절 관용구('발벗고 나서다')는 사전 단일 어절 매칭 범위 밖(backlog).
 *  - "idiom"이 아닌 카테고리는 VOC-04가 관여하지 않는다.
 */

const dict = makeDict([
  { word: "활성화", category: "idiom", alternatives: ["살아나게 하기"] },
  { word: "제고", category: "idiom", alternatives: ["높이기"] },
  { word: "상기", category: "difficult", alternatives: ["위에 적은"] },
]);
const run = (raw: string) => evaluate({ raw, dictionary: dict }, [voc04]).violations;

describe("VOC-04 추상어/관용구", () => {
  it("TC-VOC-04-01: 사전의 idiom 어절은 info", () => {
    const v = run("지역 경제를 활성화 합니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-04");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-VOC-04-02: 사전에 없는 일상어는 통과", () => {
    expect(run("학교에 갑니다.")).toHaveLength(0);
  });

  it("TC-VOC-04-03: idiom이 아닌 카테고리(difficult)는 VOC-04가 잡지 않는다", () => {
    expect(run("상기 내용을 봅니다.")).toHaveLength(0);
  });

  it("TC-VOC-04-04: 여러 개의 idiom 어절은 각각 보고한다", () => {
    const v = run("활성화 제고 방안입니다.");
    expect(v).toHaveLength(2);
    expect(v.every((x) => x.ruleId === "VOC-04")).toBe(true);
  });

  it("TC-VOC-04-05: v0.1은 정확 일치만 — 조사가 붙은 '활성화를'은 잡지 않는다(backlog)", () => {
    expect(run("활성화를 합니다.")).toHaveLength(0);
  });
});
