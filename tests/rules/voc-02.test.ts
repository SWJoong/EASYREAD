import { evaluate } from "../../src/rules/index.js";
import { voc02 } from "../../src/rules/voc/index.js";
import { makeDict } from "./voc-fixtures.js";

/**
 * VOC-02 — 불필요한 외래어/외국어 (자동 / 기본 warning). validation-checklist.md 참조.
 *
 * 구현 계약 (Instance-U가 src/rules/voc/voc-02.ts로 구현):
 *  각 문장의 각 어절 w에 대해, 아래 두 경로 중 하나라도 걸리면 finding 1건(어절당 최대 1건):
 *   (a) 사전 매칭: ctx.dictionary.lookup(w.text)의 category === "loanword"
 *       → { ruleId:"VOC-02", span:w.span, suggestion:alternatives.join(", ") }
 *   (b) 로마자 연속: w.text가 /[A-Za-z]{2,}/ 를 포함(어절 내 부분 일치 허용)
 *       → { ruleId:"VOC-02", span:w.span }  (제안 없음)
 *  - (a)가 우선. 한 어절이 (a)와 (b)에 모두 해당해도 중복 보고하지 않는다.
 *  - 단일 로마자(예: 'A형')는 판정하지 않는다(2자 이상 연속만) — 혈액형·등급 표기 오탐 방지.
 *  - "loanword"가 아닌 사전 카테고리(difficult 등)는 VOC-02가 관여하지 않는다.
 */

const dict = makeDict([
  { word: "가이드라인", category: "loanword", alternatives: ["지침"] },
  { word: "상기", category: "difficult", alternatives: ["위에 적은"] },
]);
const run = (raw: string) => evaluate({ raw, dictionary: dict }, [voc02]).violations;

describe("VOC-02 불필요한 외래어/외국어", () => {
  it("TC-VOC-02-01: 사전의 loanword 어절은 warning + 대체어 제안", () => {
    const v = run("가이드라인 문서를 봅니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-02");
    expect(v[0]?.severity).toBe("warning");
    expect(v[0]?.suggestion).toContain("지침");
  });

  it("TC-VOC-02-02: 로마자 2자 이상 연속은 warning (어절 안에 섞여 있어도 탐지)", () => {
    const v = run("MOU를 맺습니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("VOC-02");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-VOC-02-03: 우리말이고 사전에도 없으면 통과", () => {
    expect(run("오늘 학교에 갑니다.")).toHaveLength(0);
  });

  it("TC-VOC-02-04: 단일 로마자('A형')는 판정하지 않는다(2자 이상만)", () => {
    expect(run("A형 독감입니다.")).toHaveLength(0);
  });

  it("TC-VOC-02-05: loanword가 아닌 카테고리(difficult)는 VOC-02가 잡지 않는다", () => {
    expect(run("상기 내용입니다.")).toHaveLength(0);
  });

  it("TC-VOC-02-06: 이메일 주소는 외국어로 오탐하지 않는다", () => {
    // 문장 분리기가 도메인 '.'에서 쪼개 job@jobcenter.·or.·kr 3조각을 외국어로 잡던 문제(파일럿 오탐).
    expect(run("job@jobcenter.or.kr 로 신청하세요.")).toHaveLength(0);
  });

  it("TC-VOC-02-07: 측정 단위(20kg)는 외국어로 오탐하지 않는다", () => {
    expect(run("무게는 20kg 입니다.")).toHaveLength(0);
  });

  it("TC-VOC-02-08: 도메인/URL은 외국어로 오탐하지 않는다", () => {
    expect(run("www.jobcenter.or.kr 에서 확인하세요.")).toHaveLength(0);
  });

  it("TC-VOC-02-09: 실제 외국어(MOU)는 계속 warning(과소탐지 방지)", () => {
    expect(run("MOU를 맺습니다.")).toHaveLength(1);
  });
});
