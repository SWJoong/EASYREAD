import { connectClient, makeTestDictionary, firstText } from "./tool-harness.js";

/**
 * T-08 · analyze_readability 도구 계약 (FR-02, 명세: 02 §3.1). [HANDOFF→U]
 * Instance-U가 src/tools/analyze.ts(registerAnalyzeTool)로 구현하고 server.ts에서 등록하면 green.
 *
 * 계약(structuredContent) — 아래 인터페이스가 U가 만족시켜야 할 출력 형태다:
 *   charCount           : [...text].length (전체 문자 수, 공백·문장부호 포함, 코드포인트 기준)
 *   sentenceCount       : parseText(text).sentences.length
 *   paragraphCount      : parseText(text).paragraphs.length (빈 줄 기준)
 *   avgWordsPerSentence : 총 어절수 / sentenceCount (문장 0개면 0)
 *   maxSentence         : 어절 최다 문장 { excerpt, words, index } (동률이면 먼저 나온 문장)
 *   difficultWordCount  : 사전 등재어의 총 출현 횟수(어절 정확일치, 사전 없으면 0)
 *   difficultWords      : 종별 집계 [{ word, count }] (정렬 순서는 계약하지 않음)
 *   numbersDetected     : 아라비아 숫자 나열 개수 = text.match(/\d+/g)?.length ?? 0
 *   오류                : 빈/공백 text → 입력 검증(isError). dictionary는 createServer로 주입.
 */
interface Readability {
  charCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgWordsPerSentence: number;
  maxSentence: { excerpt: string; words: number; index: number };
  difficultWordCount: number;
  difficultWords: Array<{ word: string; count: number }>;
  numbersDetected: number;
}

const opened: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of opened.splice(0)) await close();
});
async function client(withDict = false) {
  const c = await connectClient(withDict ? makeTestDictionary() : undefined);
  opened.push(c.close);
  return c.client;
}

describe("analyze_readability 도구 (InMemory 계약)", () => {
  it("TC-TOOL-ANALYZE-01: tools/list에 analyze_readability가 스키마와 함께 노출된다", async () => {
    const c = await client();
    const { tools } = await c.listTools();
    const tool = tools.find((t) => t.name === "analyze_readability");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-ANALYZE-02: 문장·문단·평균어절·최장문장·글자수 지표를 계산한다", async () => {
    const c = await client();
    const text = "오늘은 좋은 날입니다. 내일도 좋겠지요.";
    const res = await c.callTool({ name: "analyze_readability", arguments: { text } });
    const sc = res.structuredContent as Readability;
    expect(sc.charCount).toBe([...text].length);
    expect(sc.sentenceCount).toBe(2);
    expect(sc.paragraphCount).toBe(1);
    expect(sc.avgWordsPerSentence).toBe(2.5); // (3 + 2) / 2
    expect(sc.maxSentence.words).toBe(3);
    expect(sc.maxSentence.index).toBe(0);
    expect(sc.maxSentence.excerpt).toContain("오늘은");
    expect(sc.numbersDetected).toBe(0);
  });

  it("TC-TOOL-ANALYZE-03: 사전 등재어(어절 정확일치)를 어려운 단어로 집계한다", async () => {
    const c = await client(true);
    const res = await c.callTool({
      name: "analyze_readability",
      arguments: { text: "구비서류 신청 안내입니다." },
    });
    const sc = res.structuredContent as Readability;
    expect(sc.difficultWordCount).toBe(2); // 구비서류 + 신청, 각 1회
    expect(sc.difficultWords).toContainEqual({ word: "구비서류", count: 1 });
    expect(sc.difficultWords).toContainEqual({ word: "신청", count: 1 });
  });

  it("TC-TOOL-ANALYZE-04: 같은 어려운 단어의 반복 출현을 종별로 합산한다", async () => {
    const c = await client(true);
    const res = await c.callTool({
      name: "analyze_readability",
      arguments: { text: "구비서류 확인. 구비서류 제출." },
    });
    const sc = res.structuredContent as Readability;
    expect(sc.difficultWords.find((d) => d.word === "구비서류")?.count).toBe(2);
  });

  it("TC-TOOL-ANALYZE-05: 아라비아 숫자 나열 개수를 센다", async () => {
    const c = await client();
    const res = await c.callTool({
      name: "analyze_readability",
      arguments: { text: "2026년 8월 13일 오후 3시" },
    });
    const sc = res.structuredContent as Readability;
    expect(sc.numbersDetected).toBe(4); // 2026, 8, 13, 3
  });

  it("TC-TOOL-ANALYZE-06: 사전이 없으면 difficultWords는 빈 배열", async () => {
    const c = await client();
    const res = await c.callTool({
      name: "analyze_readability",
      arguments: { text: "구비서류 신청 안내입니다." },
    });
    const sc = res.structuredContent as Readability;
    expect(sc.difficultWords).toEqual([]);
    expect(sc.difficultWordCount).toBe(0);
  });

  it("TC-TOOL-ANALYZE-07: 빈/공백 텍스트는 입력 검증 오류(isError)", async () => {
    const c = await client();
    const res = await c.callTool({ name: "analyze_readability", arguments: { text: "   " } });
    expect(res.isError).toBe(true);
    expect(firstText(res.content)).toBeDefined();
  });
});
