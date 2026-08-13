import { evaluate } from "../../src/rules/index.js";
import { sen07 } from "../../src/rules/sen/index.js";

/**
 * SEN-07 — 명사화·긴 수식 (보조 / 기본 warning). validation-checklist.md 참조.
 * 근거: 소소한소통 「쉬운정보 가이드라인 1.0」 §8.3.6 · Inclusion Europe #14(짧고 간결).
 *
 * 구현 계약 (Instance-U가 src/rules/sen/sen-07.ts로 구현 — sen-02.ts 패턴):
 *  - 각 문장을 어절 단위로 보고 아래 명사화·긴 수식 마커가 하나라도 있으면
 *    문장당 finding 1건 방출({ ruleId:"SEN-07", span:문장 span, message, suggestion }).
 *    severity 생략 → 엔진이 defaultSeverity "warning"으로 채운다.
 *  - 마커(오탐을 줄이려 **어절 경계**로 판정 — 부분 문자열 매칭 금지):
 *      (a) 명사화 '것': 관형형 어절(끝이 '는/은/을/ㄹ/ㄴ') 바로 뒤에 '것'으로 시작하는 어절.
 *      (b) '여부'로 시작하는 어절('여부'·'여부를'·'여부가'·'여부는').
 *      (c) 어절이 정확히 '대한'·'관한'·'통한'·'대하여'·'관하여' 중 하나('~에 대한' 류).
 *          → '대한민국' 같은 다른 어절을 잡지 않도록 **정확 일치**로만 판정한다.
 *      (d) (확장) '함으로써'·'됨으로써'·'음으로써'로 끝나는 어절.
 *  - 보조 규칙(오탐 있음) → warning. 형태소 분석 도입 시 정밀화(backlog).
 */

const run = (raw: string) => evaluate({ raw }, [sen07]).violations;

describe("SEN-07 명사화·긴 수식", () => {
  it("TC-SEN-07-01: '여부' + '~하는 것' 명사화는 warning 1건", () => {
    const v = run("신청서 제출의 완료 여부를 확인하는 것이 필요합니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-07");
    expect(v[0]?.severity).toBe("warning");
  });

  it("TC-SEN-07-02: 동사가 드러난 짧은 문장은 통과", () => {
    expect(run("신청서를 냈는지 확인하세요.")).toHaveLength(0);
  });

  it("TC-SEN-07-03: '~에 대한' 관형 명사화를 탐지한다", () => {
    const v = run("이 제도에 대한 안내입니다.");
    expect(v).toHaveLength(1);
    expect(v[0]?.ruleId).toBe("SEN-07");
  });

  it("TC-SEN-07-04: 오탐 방지 — '대한민국'은 '대한' 마커로 잡지 않는다(어절 정확 일치)", () => {
    expect(run("대한민국에서 삽니다.")).toHaveLength(0);
  });

  it("TC-SEN-07-05: 명사화 없는 일상 문장은 통과", () => {
    expect(run("오늘 학교에 갑니다.")).toHaveLength(0);
  });

  it("TC-SEN-07-06: '~하는 것을' 명사화를 탐지한다", () => {
    expect(run("서류를 제출하는 것을 잊지 마세요.")).toHaveLength(1);
  });

  it("TC-SEN-07-07: 한 문장에 마커가 여러 개여도 문장당 1건만 보고한다", () => {
    const v = run("교육 참여 여부와 서류 제출에 대한 확인이 필요합니다.");
    expect(v).toHaveLength(1);
  });
});
