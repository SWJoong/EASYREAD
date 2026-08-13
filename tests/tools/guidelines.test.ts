import { connectClient, firstText } from "./tool-harness.js";

/**
 * T-08 · get_guidelines 도구 계약 (FR-04, 명세: 02 §3.1). [HANDOFF→U]
 * Instance-U가 src/tools/guidelines.ts(registerGuidelinesTool)로 구현하고 server.ts에서 등록하면 green.
 *
 * 계약:
 *   입력  : section (enum) — "전체" | "문장" | "어휘" | "숫자" | "구성" | "표기" | "절차" | "정확성"
 *   content         : 해당 영역 지침 Markdown(비어 있지 않음)
 *   structuredContent: { section, ruleIds: string[] }
 *     - section : 입력값 그대로 반향
 *     - ruleIds : 해당 영역 규칙 ID(validation-checklist.md가 단일 소스).
 *                 문장→SEN-*, 어휘→VOC-*, 숫자→NUM-*, 구성→STR-*, 표기→TYP-*, 정확성→ACC-*,
 *                 절차→PROC-*, 전체→모든 그룹. (여기선 라이브 그룹 SEN·VOC와 전체·오류만 계약)
 *   오류  : enum 밖의 section → 입력 검증(isError).
 */
interface Guidelines {
  section: string;
  ruleIds: string[];
}

const opened: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of opened.splice(0)) await close();
});
async function client() {
  const c = await connectClient();
  opened.push(c.close);
  return c.client;
}

describe("get_guidelines 도구 (InMemory 계약)", () => {
  it("TC-TOOL-GUIDELINES-01: tools/list에 get_guidelines가 스키마와 함께 노출된다", async () => {
    const c = await client();
    const { tools } = await c.listTools();
    const tool = tools.find((t) => t.name === "get_guidelines");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-GUIDELINES-02: '문장' 영역은 SEN 규칙 ID와 Markdown 지침을 돌려준다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "get_guidelines", arguments: { section: "문장" } });
    const sc = res.structuredContent as Guidelines;
    expect(sc.section).toBe("문장");
    expect(sc.ruleIds).toContain("SEN-01");
    expect(sc.ruleIds.every((id) => id.startsWith("SEN-"))).toBe(true);
    expect((firstText(res.content) ?? "").length).toBeGreaterThan(0);
  });

  it("TC-TOOL-GUIDELINES-03: '어휘' 영역은 VOC 규칙 ID를 돌려준다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "get_guidelines", arguments: { section: "어휘" } });
    const sc = res.structuredContent as Guidelines;
    expect(sc.section).toBe("어휘");
    expect(sc.ruleIds).toContain("VOC-01");
    expect(sc.ruleIds.every((id) => id.startsWith("VOC-"))).toBe(true);
  });

  it("TC-TOOL-GUIDELINES-04: '전체'는 여러 그룹을 아우르는 규칙 ID 목록을 돌려준다", async () => {
    const c = await client();
    const res = await c.callTool({ name: "get_guidelines", arguments: { section: "전체" } });
    const sc = res.structuredContent as Guidelines;
    expect(sc.ruleIds.length).toBeGreaterThan(0);
    expect(sc.ruleIds).toContain("SEN-01");
    expect(sc.ruleIds).toContain("VOC-01");
    expect(sc.ruleIds.every((id) => /^[A-Z]+-\d+$/.test(id))).toBe(true);
  });

  it("TC-TOOL-GUIDELINES-05: enum 밖의 section은 입력 검증 오류(isError)", async () => {
    const c = await client();
    const res = await c.callTool({ name: "get_guidelines", arguments: { section: "없는영역" } });
    expect(res.isError).toBe(true);
  });
});
