import type { Paragraph, ParsedText, Sentence, Span } from "../text/index.js";

export type Severity = "error" | "warning" | "info";
export type RuleGroup = "SEN" | "VOC" | "NUM" | "STR" | "TYP" | "ACC";

export type DictionaryCategory =
  | "difficult"
  | "loanword"
  | "terminology"
  | "idiom"
  | "abbreviation";

/** 단어 사전 항목(02 §4). 상세 로더·인덱스는 data 계층(T-06). */
export interface DictionaryEntry {
  readonly word: string;
  readonly category: DictionaryCategory;
  readonly alternatives: readonly string[];
  readonly explanation?: string;
  readonly example?: string;
  readonly source: string;
}

export interface Dictionary {
  readonly entries: readonly DictionaryEntry[];
}

/** rules-config + 사용자 config를 병합해 확정한 설정(03 §5). */
export interface ResolvedRuleConfig {
  readonly maxWordsWarning: number; // SEN-01
  readonly maxWordsError: number; // SEN-01
  /** ruleId → 심각도 재정의. 비면 규칙 defaultSeverity 사용. */
  readonly severity: Readonly<Record<string, Severity>>;
  readonly excludeRules: readonly string[];
}

/** 규칙 실행에 필요한 입력. text/에서 분리·어절 계산이 끝난 상태로 들어온다. */
export interface RuleContext {
  readonly raw: string;
  readonly sentences: readonly Sentence[];
  readonly paragraphs: readonly Paragraph[];
  /** ACC 규칙 전용. 원문이 주어졌을 때만 채워진다. */
  readonly original?: ParsedText | undefined;
  readonly dictionary: Dictionary;
  readonly config: ResolvedRuleConfig;
}

/** 규칙이 방출하는 발견. severity를 생략하면 엔진이 설정/기본값으로 채운다. */
export interface RuleFinding {
  readonly ruleId: string;
  readonly message: string;
  readonly span: Span;
  readonly suggestion?: string;
  readonly severity?: Severity;
}

/** 리포트에 실리는 최종 위반 항목(02 §3.1 스키마). */
export interface Violation {
  readonly ruleId: string;
  readonly severity: Severity;
  readonly message: string;
  readonly span: Span;
  readonly excerpt?: string;
  readonly suggestion?: string;
}

/**
 * 규칙 = 순수 함수. 규칙 1개 = 파일 1개 = 골든 테스트 1개(03 §4).
 * id는 validation-checklist.md의 규칙 ID와 1:1.
 */
export interface Rule {
  readonly id: string;
  readonly group: RuleGroup;
  readonly defaultSeverity: Severity;
  /** 원문(original)이 있어야 동작하는 규칙(ACC군)이면 true. */
  readonly requiresOriginal?: boolean;
  check(ctx: RuleContext): RuleFinding[];
}
