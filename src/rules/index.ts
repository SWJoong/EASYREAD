import { evaluate } from "./engine.js";
import type { EvaluateInput } from "./engine.js";
import { rules } from "./registry.js";
import type { ValidationReport } from "./report.js";

/** 등록된 전체 규칙으로 검증한다. 도구 계층(validate_easy_read, T-05)의 진입점. */
export function validate(input: EvaluateInput): ValidationReport {
  return evaluate(input, rules);
}

export type {
  Rule,
  RuleFinding,
  RuleContext,
  Violation,
  Dictionary,
  DictionaryEntry,
  DictionaryCategory,
  Severity,
  RuleGroup,
  ResolvedRuleConfig,
} from "./types.js";
export type { EvaluateInput } from "./engine.js";
export type { RuleConfigInput } from "./config.js";
export type { ValidationReport, AssembleOptions } from "./report.js";
export { createRuleContext, runRules, evaluate } from "./engine.js";
export { getActiveRules, rules } from "./registry.js";
export { resolveConfig, defaultRuleConfig } from "./config.js";
export { assembleReport, makeExcerpt, validationReportSchema, MAX_VIOLATIONS } from "./report.js";
