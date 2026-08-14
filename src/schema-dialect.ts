import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * 도구 스키마의 JSON Schema 방언을 최신 MCP 클라이언트와 호환되게 맞춘다.
 *
 * 배경: `@modelcontextprotocol/sdk` 1.30.0의 `McpServer`는 zod 스키마를 JSON Schema로
 * 변환할 때 방언 target을 지정하지 않아 `zod-to-json-schema` 기본값인 **draft-07**로
 * `$schema`를 방출한다(server/mcp.js의 tools/list 핸들러). 최신 MCP 클라이언트는 JSON
 * Schema **2020-12**만 검증하므로, draft-07을 선언한 도구 outputSchema를 거부한다
 * ("unsupported dialect ($schema: http://json-schema.org/draft-07/schema#)").
 *
 * 도구 스키마 본문은 두 방언에서 동일한 키워드(type·properties·required·enum·min/max
 * 등)만 쓰므로, tools/list 응답에서 최상위 `$schema` 선언만 제거하면 클라이언트가 기본
 * 방언(2020-12)으로 해석해 통과한다. SDK가 변환 target을 지정하는 공개 API를 노출하지
 * 않으므로, 응답을 후처리하는 이 방식이 가장 작은 수정이다.
 *
 * 반드시 도구 등록 **전**에 호출한다. SDK가 tools/list 핸들러를 설치하는 순간을 가로채
 * 응답을 감싸야 하기 때문이다.
 */
export function normalizeToolSchemaDialect(server: McpServer): void {
  type RequestHandler = (...args: unknown[]) => unknown;
  interface LowLevelServer {
    setRequestHandler(schema: unknown, handler: RequestHandler): void;
  }
  const low = server.server as unknown as LowLevelServer;
  const originalSetRequestHandler = low.setRequestHandler.bind(low);
  low.setRequestHandler = (schema: unknown, handler: RequestHandler): void => {
    originalSetRequestHandler(schema, async (...args: unknown[]): Promise<unknown> => {
      const result = await handler(...args);
      const tools = (result as { tools?: unknown[] } | null | undefined)?.tools;
      if (Array.isArray(tools)) {
        for (const tool of tools) {
          stripDollarSchema((tool as { inputSchema?: unknown }).inputSchema);
          stripDollarSchema((tool as { outputSchema?: unknown }).outputSchema);
        }
      }
      return result;
    });
  };
}

/** JSON Schema 객체의 최상위 `$schema` 방언 선언을 제거한다(있을 때만). */
function stripDollarSchema(schema: unknown): void {
  if (typeof schema === "object" && schema !== null && "$schema" in schema) {
    delete (schema as Record<string, unknown>).$schema;
  }
}
