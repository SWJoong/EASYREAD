import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GUIDELINES_MARKDOWN, buildChecklistMarkdown } from "./data/guidelines.js";
import type { Catalog } from "./data/resources.js";
import { rules } from "./rules/index.js";
import type { Dictionary } from "./rules/index.js";
import { registerReviewPrompt } from "./prompts/review.js";
import { registerSimplifyPrompt } from "./prompts/simplify.js";
import { registerAnalyzeTool } from "./tools/analyze.js";
import { registerGuidelinesTool } from "./tools/guidelines.js";
import { registerLookupTool } from "./tools/lookup.js";
import { registerValidateTool } from "./tools/validate.js";

/**
 * EASYREAD MCP 서버를 조립한다. 도구·프롬프트·리소스 등록만 담당하고 로직은 갖지 않는다(03 §1).
 */
export function createServer(dictionary?: Dictionary, catalog?: Catalog): McpServer {
  const server = new McpServer({ name: "easyread", version: "0.1.0" });
  registerValidateTool(server, dictionary);
  registerAnalyzeTool(server, dictionary);
  registerLookupTool(server, dictionary);
  registerGuidelinesTool(server);

  // 프롬프트(FR-05·06·08, T-09)
  registerSimplifyPrompt(server);
  registerReviewPrompt(server);

  // easyread://guidelines · guidelines/checklist (정적 Markdown, FR-09·T-09)
  server.registerResource(
    "guidelines",
    "easyread://guidelines",
    { description: "쉬운 정보 작성 지침 전문", mimeType: "text/markdown" },
    () => ({
      contents: [{ uri: "easyread://guidelines", mimeType: "text/markdown", text: GUIDELINES_MARKDOWN }],
    }),
  );
  const checklist = buildChecklistMarkdown(rules);
  server.registerResource(
    "guidelines-checklist",
    "easyread://guidelines/checklist",
    { description: "검증 규칙 체크리스트(규칙 ID 표)", mimeType: "text/markdown" },
    () => ({
      contents: [{ uri: "easyread://guidelines/checklist", mimeType: "text/markdown", text: checklist }],
    }),
  );

  // easyread://dictionary (주입 사전이 있을 때만, FR-09·T-09)
  if (dictionary) {
    const dictionaryJson = JSON.stringify({ entries: dictionary.entries }, null, 2);
    server.registerResource(
      "dictionary",
      "easyread://dictionary",
      { description: "단어 사전 전체(쉬운 대체어·뜻풀이)", mimeType: "application/json" },
      () => ({
        contents: [{ uri: "easyread://dictionary", mimeType: "application/json", text: dictionaryJson }],
      }),
    );
  }

  // easyread://resources — Easy-Read 근거·표준·사례 카탈로그(ADR-07, T-14)
  if (catalog) {
    const json = JSON.stringify(catalog, null, 2);
    server.registerResource(
      "resources",
      "easyread://resources",
      {
        description: "Easy-Read 근거·표준·사례 카탈로그(66건: 지침·법령·사례·포털)",
        mimeType: "application/json",
      },
      () => ({
        contents: [{ uri: "easyread://resources", mimeType: "application/json", text: json }],
      }),
    );
  }

  return server;
}
