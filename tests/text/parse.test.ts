import { parseText } from "../../src/text/index.js";

describe("parseText 통합", () => {
  it("TC-TEXT-PARSE-01: 빈 줄로 문단을, 종결부호로 문장을 나눈다", () => {
    const parsed = parseText("제목\n\n본문 첫째 문장. 둘째 문장.");
    expect(parsed.paragraphs).toHaveLength(2);
    expect(parsed.paragraphs[0]?.sentences.map((s) => s.text)).toEqual(["제목"]);
    expect(parsed.paragraphs[1]?.sentences.map((s) => s.text)).toEqual([
      "본문 첫째 문장.",
      "둘째 문장.",
    ]);
  });

  it("TC-TEXT-PARSE-02: 문서 순번과 문단 순번이 매겨진다", () => {
    const parsed = parseText("가.\n\n나. 다.");
    expect(parsed.sentences.map((s) => s.index)).toEqual([0, 1, 2]);
    expect(parsed.sentences.map((s) => s.paragraphIndex)).toEqual([0, 1, 1]);
  });

  it("TC-TEXT-PARSE-03: 모든 문장 span은 원문으로 되잘라내면 일치한다", () => {
    const raw = '공지\n\n신청은 3월 2일까지. "서둘러요."라고 했다.';
    const parsed = parseText(raw);
    for (const s of parsed.sentences) {
      expect(raw.slice(s.span.start, s.span.end)).toBe(s.text);
    }
  });

  it("TC-TEXT-PARSE-04: wordCount가 어절 수와 같다", () => {
    const parsed = parseText("쉬운 정보를 만듭니다.");
    expect(parsed.sentences[0]?.wordCount).toBe(3);
  });

  it("TC-TEXT-PARSE-05: 빈 입력/공백만이면 빈 결과", () => {
    expect(parseText("").sentences).toHaveLength(0);
    expect(parseText("   \n\n  \t").paragraphs).toHaveLength(0);
  });

  it("TC-TEXT-PARSE-06: 이모지 혼합 — UTF-16 span으로 정확히 잘린다", () => {
    const raw = "축하해요 🎉 정말 기뻐요.";
    const parsed = parseText(raw);
    expect(parsed.sentences).toHaveLength(1);
    const s = parsed.sentences[0];
    expect(s?.wordCount).toBe(4);
    expect(raw.slice(s?.span.start, s?.span.end)).toBe(raw);
    const emoji = s?.words[1];
    expect(raw.slice(emoji?.span.start, emoji?.span.end)).toBe("🎉");
  });
});
