import type { Dictionary, DictionaryCategory, DictionaryEntry } from "../../src/rules/index.js";

/** 골든 테스트용 사전 시드 항목(축약형). source는 자동으로 채운다. */
export interface SeedEntry {
  readonly word: string;
  readonly category: DictionaryCategory;
  readonly alternatives?: readonly string[];
  readonly explanation?: string;
}

/**
 * 테스트용 Dictionary를 조립한다. 실제 시드 사전(assets/dictionary.json)과 **무관하게**
 * 결정적 골든 테스트를 만들기 위한 것 — 규칙의 판정 로직만 검증하고, 사전 데이터 변화에
 * 테스트가 흔들리지 않게 한다. lookup은 정확 일치(src/data/dictionary.ts와 동일 의미).
 */
export function makeDict(seed: readonly SeedEntry[]): Dictionary {
  const entries: DictionaryEntry[] = seed.map((e) => ({
    word: e.word,
    category: e.category,
    alternatives: e.alternatives ?? ["(대체어)"],
    explanation: e.explanation,
    source: "test-fixture",
  }));
  const byWord = new Map<string, DictionaryEntry>(entries.map((e) => [e.word, e]));
  return { entries, lookup: (word) => byWord.get(word) };
}
