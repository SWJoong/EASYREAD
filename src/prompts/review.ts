import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * easy-read-review 프롬프트를 등록한다(FR-08, 계약: 02 §3.2).
 * validate_easy_read 호출 후 위반을 규칙 ID로 인용하며 수정안을 제시하도록 지시한다.
 * original을 주면 사실 대조 지시와 원문을 함께 담는다.
 */
export function registerReviewPrompt(server: McpServer): void {
  server.registerPrompt(
    "easy-read-review",
    {
      title: "쉬운 정보 검토",
      description: "쉬운 정보 초안을 검토하는 지시를 만든다. 규칙 ID 인용과 validate_easy_read 호출을 포함하고, 원문을 주면 사실 대조를 지시한다.",
      argsSchema: {
        text: z.string().min(1).describe("검토할 변환 초안."),
        original: z.string().optional().describe("원문. 주면 사실 보존까지 대조한다."),
      },
    },
    ({ text, original }) => {
      const parts = [
        "당신은 쉬운 정보(Easy-Read) 검토자입니다. 아래 변환 초안을 점검하고 개선안을 제시하세요.",
        "",
        "## 검토 방법",
        "1. validate_easy_read 도구를 호출해 규칙 위반을 확인합니다.",
        "2. 발견한 문제는 규칙 ID(예: SEN-01)를 인용해 지적하고, 문제마다 쉬운 수정안을 함께 제시합니다.",
      ];
      if (original !== undefined && original.trim().length > 0) {
        parts.push(
          "3. 원문과 대조해 날짜·금액·기관명 같은 사실이 바뀌거나 빠지지 않았는지 확인합니다.",
          "",
          "## 원문",
          original,
        );
      }
      parts.push("", "## 검토할 초안", text);
      return { messages: [{ role: "user", content: { type: "text", text: parts.join("\n") } }] };
    },
  );
}
