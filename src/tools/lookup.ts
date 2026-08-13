import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Dictionary } from "../rules/index.js";

const DEFAULT_LIMIT = 5;

const lookupOutputSchema = z.object({
  found: z.boolean(),
  entry: z
    .object({
      word: z.string(),
      category: z.string(),
      alternatives: z.array(z.string()),
      explanation: z.string().optional(),
      example: z.string().optional(),
      source: z.string(),
    })
    .optional(),
  related: z.array(z.object({ word: z.string(), category: z.string() })),
});

/**
 * lookup_easy_word 도구를 등록한다(FR-03, 계약: 02 §3.1).
 * 미등재어는 오류가 아니다 — found:false + 부분일치 후보(related)를 돌려준다.
 */
export function registerLookupTool(server: McpServer, dictionary?: Dictionary): void {
  server.registerTool(
    "lookup_easy_word",
    {
      title: "쉬운 낱말 찾기",
      description:
        "낱말을 사전에서 찾아 쉬운 대체어·뜻풀이·예문을 돌려준다. 없으면 비슷한 낱말(related)을 함께 제안한다. 어려운 낱말을 쉬운 말로 바꿀 때 쓴다.",
      inputSchema: {
        word: z
          .string()
          .min(1, { message: "찾을 낱말을 입력하세요." })
          .max(50, { message: "낱말이 너무 깁니다(최대 50자)." })
          .describe("사전에서 찾을 낱말."),
        limit: z
          .number()
          .int()
          .positive()
          .max(50)
          .optional()
          .describe(`관련어(related) 최대 개수(기본 ${DEFAULT_LIMIT}).`),
      },
      outputSchema: lookupOutputSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ word, limit }) => {
      const max = limit ?? DEFAULT_LIMIT;
      const entry = dictionary?.lookup(word);
      const related: Array<{ word: string; category: string }> = [];
      if (dictionary !== undefined) {
        for (const e of dictionary.entries) {
          if (e.word === word) continue; // 자기 자신 제외
          if (e.word.includes(word) || word.includes(e.word)) {
            related.push({ word: e.word, category: e.category });
            if (related.length >= max) break;
          }
        }
      }
      const found = entry !== undefined;
      const structuredContent = {
        found,
        related,
        ...(entry !== undefined
          ? {
              entry: {
                word: entry.word,
                category: entry.category,
                alternatives: [...entry.alternatives],
                explanation: entry.explanation,
                example: entry.example,
                source: entry.source,
              },
            }
          : {}),
      };
      const text = found
        ? `'${word}': ${entry?.alternatives.join(", ")}`
        : `'${word}'은(는) 사전에 없습니다. 비슷한 낱말: ${related.map((r) => r.word).join(", ") || "없음"}`;
      return { content: [{ type: "text", text }], structuredContent };
    },
  );
}
