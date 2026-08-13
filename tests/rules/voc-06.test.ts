import { evaluate } from "../../src/rules/index.js";
import { voc06 } from "../../src/rules/voc/index.js";

/**
 * VOC-06 — 지시어 과다 (보조 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe §2 #12(대명사는 가리키는 대상이 분명해야) · guidelines §2(지시어를 줄인다).
 *
 * 구현 계약 (Instance-U가 src/rules/voc/voc-06.ts로 구현):
 *  - 사전 불필요(지시어 목록은 규칙 내부 상수). 문서 전체(ctx.sentences)에서 지시어 밀도를 본다.
 *  - 지시어 = 다음 집합과 **어절 정확 일치**하는 어절:
 *      {이, 그, 저, 이것, 그것, 저것, 이거, 그거, 해당, 이런, 그런, 저런,
 *       이러한, 그러한, 저러한, 여기, 거기, 저기, 이곳, 그곳}.
 *    (단일 글자 '이/그/저'는 정확 일치만 — '이순신'·'그림' 같은 어절을 잡지 않게 한다.)
 *  - 지시어 총 개수 > 문장 수 이면(밀도 > 문장당 1개) 문서 단위 finding 1건(info):
 *      { ruleId:"VOC-06", span:(첫 지시어 또는 문서 앞 구간) }  // severity 생략 → info
 *    임계값(밀도)은 설정 가능하게 설계한다.
 *  - v0.1은 정확 일치만 — 조사가 붙은 '그것을'은 미탐(backlog).
 */

const run = (raw: string) => evaluate({ raw }, [voc06]).violations;

describe("VOC-06 지시어 과다", () => {
  it("TC-VOC-06-01: 지시어 밀도가 높으면 info 1건(문서 단위)", () => {
    const v = run("그 분이 이 서류를 해당 부서에 냈습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-06");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-VOC-06-02: 지시어가 없으면 통과", () => {
    expect(run("학교에 열심히 다닙니다.")).toHaveLength(0);
  });

  it("TC-VOC-06-03: 밀도 경계 — 한 문장에 지시어 1개는 통과(1 > 1 아님)", () => {
    expect(run("그 사람이 왔습니다.")).toHaveLength(0);
  });

  it("TC-VOC-06-04: 오탐 방지 — '이순신'은 지시어 '이'로 잡지 않는다(정확 일치)", () => {
    expect(run("이순신 장군을 존경합니다.")).toHaveLength(0);
  });

  it("TC-VOC-06-05: 여러 문장에 걸친 지시어를 합산한다(문서 단위)", () => {
    // 지시어 4개(그,그,그,그) > 문장 2개 → info 1건
    const v = run("그 사람은 그 일을 합니다. 그 돈도 그 사람이 냅니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-06");
  });
});
