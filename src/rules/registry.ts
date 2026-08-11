import { senRules } from "./sen/index.js";
import { vocRules } from "./voc/index.js";
import type { Rule } from "./types.js";

/**
 * 전체 규칙 목록. 각 규칙군을 **정적 import**로 조립한다(동적 로딩 금지 — 번들·기동 단순성).
 * 규칙군이 늘면 이 배열에 추가한다(T-08: NUM·STR·TYP, T-10: ACC).
 */
export const rules: readonly Rule[] = [...senRules, ...vocRules];

export interface ActiveRuleOptions {
  readonly excludeRules?: readonly string[];
  /** 원문(original)이 주어졌는지. ACC 규칙 활성 여부를 결정한다. */
  readonly hasOriginal?: boolean;
}

/** excludeRules와 원문 유무(ACC 활성)를 반영해 실행할 규칙만 고른다. */
export function getActiveRules(source: readonly Rule[], opts: ActiveRuleOptions = {}): Rule[] {
  const exclude = new Set(opts.excludeRules ?? []);
  return source.filter((rule) => {
    if (exclude.has(rule.id)) return false;
    if (rule.requiresOriginal === true && opts.hasOriginal !== true) return false;
    return true;
  });
}
