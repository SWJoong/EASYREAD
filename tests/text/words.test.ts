import { countWords, tokenizeWords } from "../../src/text/index.js";

describe("어절 분해 (words)", () => {
  it("TC-TEXT-WORD-01: 공백 기준으로 어절을 나눈다", () => {
    const words = tokenizeWords("쉬운 정보를 만듭니다");
    expect(words.map((w) => w.text)).toEqual(["쉬운", "정보를", "만듭니다"]);
    expect(countWords("쉬운 정보를 만듭니다")).toBe(3);
  });

  it("TC-TEXT-WORD-02: URL은 1어절로 계산한다", () => {
    const text = "자세한 내용은 https://example.com/page?a=1 에서 보세요";
    const words = tokenizeWords(text);
    expect(words.map((w) => w.text)).toContain("https://example.com/page?a=1");
    expect(words).toHaveLength(5);
  });

  it("TC-TEXT-WORD-03: 여러 공백·탭·개행을 하나의 구분자로 본다", () => {
    expect(countWords("가   나\t다\n라")).toBe(4);
  });

  it("TC-TEXT-WORD-04: 빈 문자열/공백만이면 0어절", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   \n\t ")).toBe(0);
    expect(tokenizeWords("")).toEqual([]);
  });

  it("TC-TEXT-WORD-05: span으로 원문을 되잘라내면 어절과 같다", () => {
    const text = "가격은 3.14 입니다";
    const words = tokenizeWords(text, 100);
    for (const w of words) {
      expect(text.slice(w.span.start - 100, w.span.end - 100)).toBe(w.text);
      expect(w.span.end - w.span.start).toBe(w.text.length);
    }
    expect(words[1]?.span.start).toBe(100 + text.indexOf("3.14"));
  });
});
