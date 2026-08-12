import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Dictionary } from "./rules/index.js";
import type { Catalog } from "./data/resources.js";
import { registerValidateTool } from "./tools/validate.js";

/**
 * EASYREAD MCP 서버를 조립한다. 도구·프롬프트·리소스 등록만 담당하고 로직은 갖지 않는다(03 §1).
 * 도구가 늘면 여기에 register*Tool 호출을 추가한다(T-08 analyze/lookup/guidelines, T-09 프롬프트·리소스).
 */
export function createServer(dictionary?: Dictionary, catalog?: Catalog): McpServer {
  const server = new McpServer({ name: "easyread", version: "0.1.0" });
  registerValidateTool(server, dictionary);

  // easyread://resources — Easy-Read 근거·표준·사례 카탈로그(ADR-07, T-14)
  if (catalog) {
    const json = JSON.stringify(catalog, null, 2);
    server.registerResource(
      "resources",
      "easyread://resources",
      {
        description: "Easy-Read 근거·표준·사례 카탈로그(62건: 지침·법령·사례·포털)",
        mimeType: "application/json",
      },
      () => ({ contents: [{ uri: "easyread://resources", text: json }] }),
    );
  }

  return server;
}
