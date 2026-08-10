#!/usr/bin/env node
/**
 * EASYREAD MCP 서버 엔트리. stdio 트랜스포트로 기동한다.
 * 계약: docs/plan/02-architecture.md §3 · 구현 방침: docs/plan/03-backend-plan.md
 *
 * 로깅 규약: stdout은 JSON-RPC 채널이므로 절대 쓰지 않는다. 로그는 stderr(console.error)만,
 * 그리고 사용자 텍스트 본문·스택은 싣지 않는다(NFR-03).
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadDictionary } from "./data/dictionary.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  // 사전 데이터 로드(실패 시 throw → 아래 catch에서 stderr 후 exit 1).
  const dictionary = loadDictionary();
  const server = createServer(dictionary);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : "";
  console.error(`[easyread] 서버를 시작하지 못했습니다. ${detail}`);
  process.exit(1);
});
