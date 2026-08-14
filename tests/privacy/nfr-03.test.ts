import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/**
 * NFR-03 · 무로깅(입력 프라이버시) 실증. 이 서버는 사용자 입력 본문을 로그에 남기지 않는다.
 * 규약(src/index.ts): stdout은 JSON-RPC 채널이라 로그 금지, 로그는 console.error(stderr)만 —
 * 그리고 입력 텍스트·스택은 싣지 않는다. 빌드 산출물을 실제 stdio로 기동해 stderr를 캡처하고,
 * validate 입력에 넣은 유일 센티넬이 stderr에 나타나지 않으며 정상 호출이 로그를 새로 만들지
 * 않음을 단정한다.
 *
 * 자동으로 못 잡는 것(신규 console.error 도입 여부)은 코드리뷰로 보강한다 — 현재 src의 console.*
 * 사용처는 기동 실패 시 1건(src/index.ts, error.message만·스택/입력 제외)뿐이다.
 */
const dist = fileURLToPath(new URL("../../dist/index.js", import.meta.url));
const SENTINEL = "카나리아센티넬X7Q";

let client: Client;
let transport: StdioClientTransport;
let stderrBuf = "";

beforeAll(async () => {
  if (!existsSync(dist)) {
    execSync("npm run build", { stdio: "ignore" });
  }
  transport = new StdioClientTransport({ command: "node", args: [dist], stderr: "pipe" });
  // stderr PassThrough는 즉시 반환되므로 connect 전에 리스너를 붙여 기동 로그까지 포함해 캡처한다.
  transport.stderr?.on("data", (d: Buffer) => {
    stderrBuf += d.toString("utf8");
  });
  client = new Client({ name: "nfr03", version: "0.0.0" });
  await client.connect(transport);
}, 30_000);

afterAll(async () => {
  await client?.close();
});

const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 50));

describe("NFR-03 무로깅 — 입력 프라이버시 (빌드 dist stdio)", () => {
  it("TC-PRIV-01: validate_easy_read 입력 본문이 stderr 로그에 남지 않는다", async () => {
    await client.callTool({
      name: "validate_easy_read",
      arguments: { text: `${SENTINEL} 신청하지 않으면 받을 수 없습니다.` },
    });
    await flush();
    expect(stderrBuf).not.toContain(SENTINEL);
    expect(stderrBuf).not.toContain("신청하지");
  });

  it("TC-PRIV-02: 정상 validate 호출은 stderr 로그를 새로 만들지 않는다 (무로깅)", async () => {
    const before = stderrBuf.length;
    await client.callTool({
      name: "validate_easy_read",
      arguments: { text: `${SENTINEL}2 다른 안내 문장입니다.` },
    });
    await flush();
    expect(stderrBuf.length).toBe(before); // 검증 경로는 stderr에 아무것도 쓰지 않는다
    expect(stderrBuf).not.toContain(`${SENTINEL}2`);
  });
});
