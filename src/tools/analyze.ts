import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Dictionary } from "../rules/index.js";
import { parseText } from "../text/index.js";

const MAX_CHARS = 50_000;

const analyzeOutputSchema = z.object({
  charCount: z.number(),
  sentenceCount: z.number(),
  paragraphCount: z.number(),
  avgWordsPerSentence: z.number(),
  maxSentence: z.object({ excerpt: z.string(), words: z.number(), index: z.number() }),
  difficultWordCount: z.number(),
  difficultWords: z.array(z.object({ word: z.string(), count: z.number() })),
  numbersDetected: z.number(),
});
type Readability = z.infer<typeof analyzeOutputSchema>;

function formatAnalyze(r: Readability): string {
  return [
    `글자 ${r.charCount}자 · 문장 ${r.sentenceCount}개 · 문단 ${r.paragraphCount}개`,
    `문장당 평균 ${r.avgWordsPerSentence} 어절, 가장 긴 문장 ${r.maxSentence.words} 어절.`,
    `어려운 낱말 ${r.difficultWordCount}회, 숫자 ${r.numbersDetected}개.`,
  ].join("\n");
}

/**
 * analyze_readability 도구를 등록한다(FR-02, 계약: 02 §3.1).
 * 지표 계산만 하고 판정은 하지 않는다. 어려운 낱말은 주입된 dictionary로 집계한다.
 */
export function registerAnalyzeTool(server: McpServer, dictionary?: Dictionary): void {
  server.registerTool(
    "analyze_readability",
    {
      title: "가독성 분석",
      description:
        "한국어 텍스트의 가독성 지표(글자·문장·문단 수, 평균 어절, 가장 긴 문장, 어려운 낱말, 숫자)를 계산한다. 쉬운 정보로 고치기 전후를 견주거나 어디부터 손볼지 정할 때 쓴다.",
      inputSchema: {
        text: z
          .string()
          .min(1, { message: "분석할 텍스트를 입력하세요." })
          .max(MAX_CHARS, { message: "텍스트가 너무 깁니다(최대 50,000자)." })
          .refine((s) => s.trim().length > 0, { message: "빈 텍스트입니다. 분석할 내용을 입력하세요." })
          .describe("분석할 텍스트(1~50,000자)."),
      },
      outputSchema: analyzeOutputSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ text }) => {
      const parsed = parseText(text);
      const sentenceCount = parsed.sentences.length;
      const totalWords = parsed.sentences.reduce((n, s) => n + s.wordCount, 0);
      let maxSentence = { excerpt: "", words: 0, index: 0 };
      for (const s of parsed.sentences) {
        if (s.wordCount > maxSentence.words) {
          maxSentence = { excerpt: s.text, words: s.wordCount, index: s.index };
        }
      }
      const counts = new Map<string, number>();
      if (dictionary !== undefined) {
        for (const s of parsed.sentences) {
          for (const w of s.words) {
            if (dictionary.lookup(w.text) !== undefined) {
              counts.set(w.text, (counts.get(w.text) ?? 0) + 1);
            }
          }
        }
      }
      const difficultWords = [...counts].map(([word, count]) => ({ word, count }));
      const result: Readability = {
        charCount: [...text].length,
        sentenceCount,
        paragraphCount: parsed.paragraphs.length,
        avgWordsPerSentence: sentenceCount === 0 ? 0 : Math.round((totalWords / sentenceCount) * 10) / 10,
        maxSentence,
        difficultWordCount: difficultWords.reduce((n, d) => n + d.count, 0),
        difficultWords,
        numbersDetected: (text.match(/\d+/g) ?? []).length,
      };
      return { content: [{ type: "text", text: formatAnalyze(result) }], structuredContent: result };
    },
  );
}
