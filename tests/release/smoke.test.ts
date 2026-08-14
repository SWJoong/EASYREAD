import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * T-12 · 설치 스모크 (배포 전 자동 게이트). 빌드된 dist/index.js를 실제 stdio MCP 서버로 기동해
 * initialize 핸드셰이크 + 전 표면(도구 4·프롬프트 2·리소스 4) 노출을 확인한다. 실 자산
 * (assets/dictionary.json·resources.json)을 로드해 기동한다 — release.yml의 배포 후 npx 스모크에
 * 대응하는 배포 전 버전. CI는 test 전에 Build 스텝을 돌리므로 dist가 있고, 로컬 등 없을 때만 빌드한다.
 */
const dist = fileURLToPath(new URL("../../dist/index.js", import.meta.url));

let client: Client;
let transport: StdioClientTransport;

beforeAll(async () => {
  if (!existsSync(dist)) {
    execSync("npm run build", { stdio: "ignore" });
  }
  transport = new StdioClientTransport({ command: "node", args: [dist] });
  client = new Client({ name: "smoke", version: "0.0.0" });
  await client.connect(transport); // initialize 핸드셰이크
}, 30_000);

afterAll(async () => {
  await client?.close();
});

describe("설치 스모크 (빌드된 dist/index.js stdio 기동, T-12)", () => {
  it("TC-SMOKE-01: initialize 후 serverInfo.name이 easyread다", () => {
    expect(client.getServerVersion()?.name).toBe("easyread");
  });

  it("TC-SMOKE-02: 도구 4종이 노출된다", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    for (const n of [
      "validate_easy_read",
      "analyze_readability",
      "lookup_easy_word",
      "get_guidelines",
    ]) {
      expect(names).toContain(n);
    }
  });

  it("TC-SMOKE-03: 프롬프트 2종이 노출된다", async () => {
    const { prompts } = await client.listPrompts();
    const names = prompts.map((p) => p.name);
    expect(names).toContain("simplify-text");
    expect(names).toContain("easy-read-review");
  });

  it("TC-SMOKE-04: 리소스 4종(guidelines·checklist·dictionary·resources)이 노출된다", async () => {
    const { resources } = await client.listResources();
    const uris = resources.map((r) => r.uri);
    for (const u of [
      "easyread://guidelines",
      "easyread://guidelines/checklist",
      "easyread://dictionary",
      "easyread://resources",
    ]) {
      expect(uris).toContain(u);
    }
  });

  it("TC-SMOKE-05: validate_easy_read가 실 자산으로 end-to-end 동작한다", async () => {
    const res = await client.callTool({
      name: "validate_easy_read",
      arguments: { text: "신청하지 않으면 받을 수 없습니다." },
    });
    const report = res.structuredContent as { verdict: string; violations: Array<{ ruleId: string }> };
    expect(report.verdict).toBe("fail");
    expect(report.violations.some((v) => v.ruleId === "SEN-04")).toBe(true);
  });
});
