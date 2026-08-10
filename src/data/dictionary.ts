import { readFileSync } from "node:fs";
import { z } from "zod";
import type { Dictionary, DictionaryEntry } from "../rules/types.js";

const entrySchema = z.object({
  word: z.string().min(1),
  category: z.enum(["difficult", "loanword", "terminology", "idiom", "abbreviation"]),
  alternatives: z.array(z.string().min(1)).min(1),
  explanation: z.string().min(1).optional(),
  example: z.string().min(1).optional(),
  source: z.string().min(1), // 출처 필드 의무(NFR-04, R-01)
});

const dictionaryFileSchema = z.object({
  version: z.string().min(1),
  updatedAt: z.string().min(1),
  entries: z.array(entrySchema).min(1),
});

function buildDictionary(entries: readonly DictionaryEntry[]): Dictionary {
  const byWord = new Map<string, DictionaryEntry>();
  for (const entry of entries) byWord.set(entry.word, entry);
  return {
    entries,
    lookup: (word) => byWord.get(word),
  };
}

/**
 * 데이터를 zod로 검증해 Dictionary로 만든다. 실패 시 **어떤 항목이 왜** 실패했는지 담아 throw
 * (조용한 데이터 오류 방지, 03 §5). 파일 I/O와 분리해 테스트 가능하게 둔다.
 */
export function parseDictionary(data: unknown): Dictionary {
  const result = dictionaryFileSchema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 8)
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`사전 데이터 검증에 실패했습니다:\n${detail}`);
  }
  const seen = new Set<string>();
  for (const entry of result.data.entries) {
    if (seen.has(entry.word)) throw new Error(`사전에 중복된 단어가 있습니다: "${entry.word}"`);
    seen.add(entry.word);
  }
  return buildDictionary(result.data.entries);
}

/**
 * assets/dictionary.json을 기동 시 1회 읽어 검증한다(03 §5). 실패 시 throw →
 * index.ts가 stderr로 알리고 exit 1. 경로는 import.meta.url 기준(전역 설치·npx 모두 동작).
 */
export function loadDictionary(): Dictionary {
  const url = new URL("../../assets/dictionary.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`사전 파일을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseDictionary(json);
}
