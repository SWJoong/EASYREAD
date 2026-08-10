import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerValidateTool } from "./tools/validate.js";

/**
 * EASYREAD MCP 서버를 조립한다. 도구·프롬프트·리소스 등록만 담당하고 로직은 갖지 않는다(03 §1).
 * 도구가 늘면 여기에 register*Tool 호출을 추가한다(T-08 analyze/lookup/guidelines, T-09 프롬프트·리소스).
 */
export function createServer(): McpServer {
  const server = new McpServer({ name: "easyread", version: "0.1.0" });
  registerValidateTool(server);
  return server;
}
