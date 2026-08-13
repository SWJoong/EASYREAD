import { connectClient, makeTestDictionary } from "../tools/tool-harness.js";
import type { ValidationReport } from "../../src/rules/index.js";

/**
 * T-11 · 통합(E2E) — 조립된 서버를 InMemory transport로 끝까지 돌려 전 FR을 교차 검증한다.
 * 머지된 표면(규칙 25 + 도구 4) 대상이라 green. 프롬프트·리소스(T-09) E2E는 T-09 머지 후 확장.
 */
interface Readability {
  difficultWordCount: number;
  difficultWords: Array<{ word: string; count: number }>;
}
interface LookupResult {
  found: boolean;
  entry?: { alternatives: string[] };
}
interface Guidelines {
  ruleIds: string[];
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

describe("통합 E2E (InMemory, 전 FR 교차)", () => {
  it("TC-INT-01: validate가 위반을 잡아 fail 판정 + 감수 고지(FR-01·06·07·10)를 낸다", async () => {
    const c = await client();
    const res = await c.callTool({
      name: "validate_easy_read",
      arguments: { text: "신청하지 않으면 받을 수 없습니다. 구비서류를 지참하시기 바랍니다." },
    });
    const report = res.structuredContent as ValidationReport;
    expect(report.verdict).toBe("fail");
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(true);
    // FR-06: 리포트에 '당사자 감수' 고지가 항상 붙는다(PROC-01).
    expect(report.notices.some((n) => n.includes("감수"))).toBe(true);
    const content = res.content as Array<{ type: string; text?: string }>;
    expect(content[0]?.text).toContain("판정");
  });

  it("TC-INT-02: 원문 대조로 날짜 왜곡(ACC-01)을 잡는다(FR-07)", async () => {
    const c = await client();
    const res = await c.callTool({
      name: "validate_easy_read",
      arguments: { text: "신청은 3월 5일까지 하세요.", original: "신청 기간은 3월 2일까지입니다." },
    });
    const report = res.structuredContent as ValidationReport;
    const acc01 = report.violations.find((v) => v.ruleId === "ACC-01");
    expect(acc01).toBeDefined();
    expect(acc01?.severity).toBe("error");
    expect(report.verdict).toBe("fail");
  });

  it("TC-INT-03: analyze가 짚은 어려운 단어를 lookup이 쉬운 말로 풀어 준다(FR-02·03 정합)", async () => {
    const c = await client(true);
    const analyzed = await c.callTool({
      name: "analyze_readability",
      arguments: { text: "구비서류 준비 안내입니다." },
    });
    const readability = analyzed.structuredContent as Readability;
    expect(readability.difficultWords.some((d) => d.word === "구비서류")).toBe(true);

    const looked = await c.callTool({ name: "lookup_easy_word", arguments: { word: "구비서류" } });
    const lookup = looked.structuredContent as LookupResult;
    expect(lookup.found).toBe(true);
    expect(lookup.entry?.alternatives).toContain("필요한 서류");
  });

  it("TC-INT-04: get_guidelines가 알리는 규칙을 엔진이 실제로 집행한다(FR-04 정합)", async () => {
    const c = await client();
    const guide = await c.callTool({ name: "get_guidelines", arguments: { section: "문장" } });
    const guidelines = guide.structuredContent as Guidelines;
    expect(guidelines.ruleIds).toContain("SEN-04");

    const validated = await c.callTool({
      name: "validate_easy_read",
      arguments: { text: "신청하지 않으면 받을 수 없습니다." },
    });
    const report = validated.structuredContent as ValidationReport;
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(true);
  });
});
