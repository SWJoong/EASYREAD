import type { ResolvedRuleConfig, Severity } from "./types.js";

/** validate 도구의 config 인자(모두 선택). */
export interface RuleConfigInput {
  readonly maxWordsWarning?: number;
  readonly maxWordsError?: number;
  readonly severity?: Readonly<Record<string, Severity>>;
  readonly excludeRules?: readonly string[];
}

/**
 * 기본 설정. rules-config.json(assets) 도입(T-06/T-07) 전까지의 기본값이며,
 * SEN-01 임계값 등 validation-checklist의 기본값과 일치한다.
 */
export const defaultRuleConfig: ResolvedRuleConfig = {
  maxWordsWarning: 10,
  maxWordsError: 15,
  severity: {},
  excludeRules: [],
};

/** 사용자 값 우선, 미지정은 기본값(03 §5 병합 규칙). */
export function resolveConfig(input: RuleConfigInput = {}): ResolvedRuleConfig {
  return {
    maxWordsWarning: input.maxWordsWarning ?? defaultRuleConfig.maxWordsWarning,
    maxWordsError: input.maxWordsError ?? defaultRuleConfig.maxWordsError,
    severity: { ...defaultRuleConfig.severity, ...(input.severity ?? {}) },
    excludeRules: input.excludeRules ?? defaultRuleConfig.excludeRules,
  };
}
