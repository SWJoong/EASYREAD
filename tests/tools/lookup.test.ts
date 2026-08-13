import { connectClient, makeTestDictionary } from "./tool-harness.js";

/**
 * T-08 · lookup_easy_word 도구 계약 (FR-03, 명세: 02 §3.1). [HANDOFF→U]
 * Instance-U가 src/tools/lookup.ts(registerLookupTool)로 구현하고 server.ts에서 등록하면 green.
 *
 * 계약(structuredContent):
 *   found   : boolean  — dictionary.lookup(word) 어절 정확일치 여부
 *   entry?  : 등재 시 { word, category, alternatives, explanation?, example?, source } (사전 항목 그대로)
 *   related : [{ word, category }] — word가 query를 포함하거나 query가 word를 포함하는 **다른** 항목
 *             (양방향 부분일치), 최대 limit개. 등재/미등재 무관하게 채운다.
 *   limit   : 입력, 기본 5 — related 최대 개수.
 *   ⚠ 미등재어는 오류가 아니다 → found:false + related만 채워 반환(isError 아님).
 *   오류    : 빈 word / 50자 초과 word → 입력 검증(isError).
 */
interface LookupResult {
  found: boolean;
  entry?: {
    word: string;
    category: string;
    alternatives: string[];
    explanation?: string;
    example?: string;
    source: string;
  };
  related: Array<{ word: string; category: string }>;
}

const opened: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of opened.splice(0)) await close();
});
async function client() {
  const c = await connectClient(makeTestDictionary());
  opened.push(c.close);
  return c.client;
}

describe("lookup_easy_word 도구 (InMemory 계약)", () => {
  it("TC-TOOL-LOOKUP-01: tools/list에 lookup_easy_word가 스키마와 함께 노출된다", async () => {
    const c = await client();
    const { tools } = await c.listTools();
    const tool = tools.find((t) => t.name === "lookup_easy_word");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-LOOKUP-02: 등재어는 found:true와 사전 항목(대체어 포함)을 돌려준다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "lookup_easy_word", arguments: { word: "구비서류" } });
    const sc = res.structuredContent as LookupResult;
    expect(sc.found).toBe(true);
    expect(sc.entry?.word).toBe("구비서류");
    expect(sc.entry?.category).toBe("difficult");
    expect(sc.entry?.alternatives).toContain("필요한 서류");
    expect(sc.entry?.explanation).toBe("제출해야 하는 서류");
  });

  it("TC-TOOL-LOOKUP-03: 미등재어는 오류가 아니라 found:false로 응답한다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "lookup_easy_word", arguments: { word: "존재하지않는말xyz" } });
    const sc = res.structuredContent as LookupResult;
    expect(res.isError).not.toBe(true);
    expect(sc.found).toBe(false);
    expect(sc.entry).toBeUndefined();
    expect(Array.isArray(sc.related)).toBe(true);
  });

  it("TC-TOOL-LOOKUP-04: 미등재어라도 부분일치 후보(related)를 채운다", async () => {
    const c = await client();
    // "신청서류"는 미등재지만 "신청"·"신청서"를 부분 포함한다.
    const res = await c.callTool({ name: "lookup_easy_word", arguments: { word: "신청서류" } });
    const sc = res.structuredContent as LookupResult;
    expect(sc.found).toBe(false);
    const words = sc.related.map((r) => r.word);
    expect(words).toContain("신청");
    expect(words).toContain("신청서");
  });

  it("TC-TOOL-LOOKUP-05: 등재어의 related는 부분일치하는 '다른' 항목이며 자기 자신은 제외한다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "lookup_easy_word", arguments: { word: "신청" } });
    const sc = res.structuredContent as LookupResult;
    const words = sc.related.map((r) => r.word);
    expect(words).toContain("신청서");
    expect(words).toContain("신청기간");
    expect(words).not.toContain("신청");
  });

  it("TC-TOOL-LOOKUP-06: limit로 related 개수를 제한한다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "lookup_easy_word", arguments: { word: "신청", limit: 1 } });
    const sc = res.structuredContent as LookupResult;
    expect(sc.related.length).toBeLessThanOrEqual(1);
  });

  it("TC-TOOL-LOOKUP-07: 빈 word / 50자 초과 word는 입력 검증 오류(isError)", async () => {
    const c = await client();
    const empty = await c.callTool({ name: "lookup_easy_word", arguments: { word: "" } });
    expect(empty.isError).toBe(true);
    const tooLong = await c.callTool({ name: "lookup_easy_word", arguments: { word: "가".repeat(51) } });
    expect(tooLong.isError).toBe(true);
  });
});
