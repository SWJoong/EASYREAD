import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../../src/server.js";
import type { ValidationReport } from "../../src/rules/index.js";

const cleanups: Array<() => Promise<void>> = [];

afterEach(async () => {
  for (const close of cleanups.splice(0)) await close();
});

/** 서버·클라이언트를 인메모리로 연결하고 클라이언트를 돌려준다. */
async function connectClient(): Promise<Client> {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  cleanups.push(async () => {
    await client.close();
    await server.close();
  });
  return client;
}

describe("validate_easy_read 도구 (InMemory 계약)", () => {
  it("TC-TOOL-VALIDATE-01: tools/list에 validate_easy_read가 노출된다", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    const tool = tools.find((t) => t.name === "validate_easy_read");
    expect(tool).toBeDefined();
    expect(tool?.inputSchema).toBeDefined();
    expect(tool?.outputSchema).toBeDefined();
  });

  it("TC-TOOL-VALIDATE-02: SEN-04 이중 부정을 검출하고 fail 판정을 낸다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "validate_easy_read",
      arguments: { text: "신청하지 않으면 받을 수 없습니다." },
    });
    const report = res.structuredContent as ValidationReport;
    expect(report.verdict).toBe("fail");
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(true);
    expect(Array.isArray(res.content)).toBe(true);
  });

  it("TC-TOOL-VALIDATE-03: 긴 문장은 SEN-01 경고, content에 요약이 담긴다", async () => {
    const client = await connectClient();
    const longSentence = `${Array.from({ length: 12 }, () => "말").join(" ")}.`;
    const res = await client.callTool({
      name: "validate_easy_read",
      arguments: { text: longSentence },
    });
    const report = res.structuredContent as ValidationReport;
    expect(report.violations.some((v) => v.ruleId === "SEN-01")).toBe(true);
    const content = res.content as Array<{ type: string; text?: string }>;
    expect(content[0]?.text).toContain("판정");
    expect(content[0]?.text).toContain("당사자 감수");
  });

  it("TC-TOOL-VALIDATE-04: 빈/공백 텍스트는 입력 검증 오류를 isError로 돌려준다", async () => {
    const client = await connectClient();
    const res = await client.callTool({ name: "validate_easy_read", arguments: { text: "   " } });
    expect(res.isError).toBe(true);
    const content = res.content as Array<{ type: string; text?: string }>;
    expect(content[0]?.text).toContain("빈 텍스트");
  });

  it("TC-TOOL-VALIDATE-06: 5만자 초과는 '나눠서 검사' 안내와 함께 오류", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "validate_easy_read",
      arguments: { text: "가".repeat(50_001) },
    });
    expect(res.isError).toBe(true);
    const content = res.content as Array<{ type: string; text?: string }>;
    expect(content[0]?.text).toContain("나눠서");
  });

  it("TC-TOOL-VALIDATE-05: config.excludeRules로 특정 규칙을 끈다", async () => {
    const client = await connectClient();
    const res = await client.callTool({
      name: "validate_easy_read",
      arguments: { text: "신청하지 않으면 받을 수 없습니다.", config: { excludeRules: ["SEN-04"] } },
    });
    const report = res.structuredContent as ValidationReport;
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(false);
  });
});
