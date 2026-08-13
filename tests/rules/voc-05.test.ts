import { evaluate } from "../../src/rules/index.js";
import { voc05 } from "../../src/rules/voc/index.js";
import { makeDict } from "./voc-fixtures.js";

/**
 * VOC-05 — 풀이 없는 줄임말/약어 첫 사용 (보조 / 기본 warning). validation-checklist.md 참조.
 * 근거: Inclusion Europe #12(약어 지양, 풀어 설명) · guidelines §2(줄임말은 첫 등장에서 풀어 쓴다).
 *
 * 구현 계약 (Instance-U가 src/rules/voc/voc-05.ts로 구현):
 *  - 문서 전체(ctx.sentences 순서)를 훑어 약어를 추적한다. 각 어절 w에 대해
 *    ctx.dictionary.lookup(w.text) 결과가 category === "abbreviation" 이면 약어로 본다.
 *  - **각 약어의 첫 등장만** 판정한다(이후 등장은 무시 — '이후 반복 사용은 허용').
 *  - 첫 등장이 **괄호 풀이를 동반하지 않으면** finding 1건:
 *      { ruleId:"VOC-05", span:w.span, message:(첫 등장에서 풀어 쓰기 권유) }  // severity 생략 → warning
 *  - 괄호 풀이 판정: 바로 다음 어절이 '('로 시작하거나, 매칭 어절 자체에 '('가 포함되면 "설명됨".
 *  - v0.1은 **어절 정확 일치**만(조사 결합 'WHO가'는 미탐 — backlog).
 */

const dict = makeDict([
  { word: "WHO", category: "abbreviation", alternatives: ["세계보건기구"] },
]);
const run = (raw: string) => evaluate({ raw, dictionary: dict }, [voc05]).violations;

describe("VOC-05 풀이 없는 약어 첫 사용", () => {
  it("TC-VOC-05-01: 풀이 없는 약어 첫 사용은 warning", () => {
    const v = run("WHO 발표를 봤습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-05");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-VOC-05-02: 첫 등장에 괄호 풀이가 있으면 통과", () => {
    expect(run("WHO (세계보건기구) 발표를 봤습니다.")).toHaveLength(0);
  });

  it("TC-VOC-05-03: 첫 등장만 보고한다 — 이후 반복은 잡지 않는다", () => {
    const v = run("WHO 발표입니다. WHO 회의도 있습니다.");
    expect(v).toHaveLength(1);
  });

  it("TC-VOC-05-04: 사전에 없는 일상어는 통과", () => {
    expect(run("학교에 갑니다.")).toHaveLength(0);
  });

  it("TC-VOC-05-05: v0.1은 정확 일치만 — 조사가 붙은 'WHO가'는 잡지 않는다(backlog)", () => {
    expect(run("WHO가 발표했습니다.")).toHaveLength(0);
  });
});
