import { splitSentenceSpans } from "../../src/text/index.js";

function sents(text: string): string[] {
  return splitSentenceSpans(text).map((s) => text.slice(s.start, s.end));
}

describe("문장 분리 (sentences)", () => {
  it("TC-TEXT-SENT-01: 마침표로 문장을 나눈다", () => {
    expect(sents("신청하세요. 기다리세요.")).toEqual(["신청하세요.", "기다리세요."]);
  });

  it("TC-TEXT-SENT-02: 물음표·느낌표로 나눈다", () => {
    expect(sents("왜요? 정말!")).toEqual(["왜요?", "정말!"]);
  });

  it("TC-TEXT-SENT-03: 소수점·백분율은 문장을 나누지 않는다", () => {
    expect(sents("가격은 3.14 입니다.")).toEqual(["가격은 3.14 입니다."]);
    expect(sents("응답자의 47.3% 입니다.")).toEqual(["응답자의 47.3% 입니다."]);
  });

  it("TC-TEXT-SENT-04: 날짜 '2026. 8. 9.'를 한 문장으로 유지한다", () => {
    expect(sents("행사는 2026. 8. 9. 열립니다.")).toEqual(["행사는 2026. 8. 9. 열립니다."]);
  });

  it("TC-TEXT-SENT-05: 버전/순번 마침표를 나누지 않는다", () => {
    expect(sents("버전 1.2.3 을 쓰세요.")).toEqual(["버전 1.2.3 을 쓰세요."]);
  });

  it("TC-TEXT-SENT-06: 따옴표 안 종결부호 뒤 조사가 붙으면 한 문장", () => {
    expect(sents('그는 "안녕하세요."라고 말했다.')).toEqual(['그는 "안녕하세요."라고 말했다.']);
  });

  it("TC-TEXT-SENT-07: 인용문이 문장 전체면 닫는 따옴표 뒤에서 나눈다", () => {
    expect(sents('"신청하세요." 다음에 오세요.')).toEqual(['"신청하세요."', "다음에 오세요."]);
  });

  it("TC-TEXT-SENT-08: 인용문 내부의 종결부호로는 나누지 않는다", () => {
    expect(sents('그는 "안녕. 또 봐."라고 했다.')).toEqual(['그는 "안녕. 또 봐."라고 했다.']);
  });

  it("TC-TEXT-SENT-09: 괄호 안 종결부호로는 나누지 않는다", () => {
    expect(sents("메모(참고. 필독)를 보세요.")).toEqual(["메모(참고. 필독)를 보세요."]);
  });

  it("TC-TEXT-SENT-10: 연속 종결부호를 하나의 경계로 흡수한다", () => {
    expect(sents("정말요?! 좋아요...")).toEqual(["정말요?!", "좋아요..."]);
  });

  it("TC-TEXT-SENT-11: 개행은 문장 경계다(문장부호 없는 목록)", () => {
    expect(sents("사과\n배\n감")).toEqual(["사과", "배", "감"]);
  });

  it("TC-TEXT-SENT-12: 종결부호 없는 단문도 한 문장", () => {
    expect(sents("안녕하세요")).toEqual(["안녕하세요"]);
  });

  it("TC-TEXT-SENT-13: offset이 span에 반영된다", () => {
    const spans = splitSentenceSpans("가. 나.", 50);
    expect(spans[0]).toEqual({ start: 50, end: 52 });
    expect(spans[1]?.start).toBe(53);
  });

  it("TC-TEXT-SENT-14: 이메일·URL 안의 마침표로는 나누지 않는다(한 어절 유지)", () => {
    // 종결부호는 뒤가 공백/끝일 때만 경계 — 도메인 내부 '.'은 어절을 쪼개지 않는다.
    expect(sents("메일 job@jobcenter.or.kr 로 보내세요. 감사합니다.")).toEqual([
      "메일 job@jobcenter.or.kr 로 보내세요.",
      "감사합니다.",
    ]);
    expect(sents("사이트는 www.naver.com 입니다.")).toEqual(["사이트는 www.naver.com 입니다."]);
  });
});
