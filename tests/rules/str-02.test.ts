import { evaluate } from "../../src/rules/index.js";
import { str02 } from "../../src/rules/str/index.js";

/**
 * STR-02 — 단락이 너무 길다 (자동 / 기본 info). validation-checklist.md 참조.
 * 근거: Inclusion Europe(짧은 단락) · guidelines §4(한 단락 한 주제).
 *
 * 구현 계약 (Instance-U가 src/rules/str/str-02.ts로 구현):
 *  - 각 문단(ctx.paragraphs)의 문장 수(paragraph.sentences.length)가 5를 초과하면 문단마다 info 1건.
 *    { ruleId:"STR-02", span:(문단 span) }  severity 생략 → info. 임계값(5)은 조정 가능하게.
 *  - 문단은 빈 줄로 구분된다(text 계층). 5문장 이하 문단은 통과.
 *
 * 참고: STR-01(결론 먼저)·STR-04(절차 번호)는 '수동' 항목 — 자동 탐지 규칙이 아니라
 *       리포트 점검 안내(PROC류)로 다룬다. 등록 규칙(registry)에 포함하지 않는다.
 */
const run = (raw: string) => evaluate({ raw }, [str02]).violations;

describe("STR-02 단락 길이", () => {
  it("TC-STR-02-01: 6문장 문단은 info", () => {
    const v = run("가. 나. 다. 라. 마. 바.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("STR-02");
    expect(v[0]?.severity).toBe("info");
  });

  it("TC-STR-02-02: 5문장 문단은 통과(경계)", () => {
    expect(run("가. 나. 다. 라. 마.")).toHaveLength(0);
  });

  it("TC-STR-02-03: 짧은 문단은 통과", () => {
    expect(run("짧다. 끝.")).toHaveLength(0);
  });

  it("TC-STR-02-04: 긴 문단만 보고한다(문단별 판정)", () => {
    // 문단1(3문장) + 빈 줄 + 문단2(6문장) → 문단2만
    const v = run("가. 나. 다.\n\n라. 마. 바. 사. 아. 자.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("STR-02");
  });
});
