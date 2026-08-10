import { parseText } from "../text/index.js";
import type { RuleConfigInput } from "./config.js";
import { resolveConfig } from "./config.js";
import { getActiveRules } from "./registry.js";
import { assembleReport, makeExcerpt } from "./report.js";
import type { ValidationReport } from "./report.js";
import type { Dictionary, Rule, RuleContext, Violation } from "./types.js";

const EMPTY_DICTIONARY: Dictionary = { entries: [], lookup: () => undefined };

export interface EvaluateInput {
  readonly raw: string;
  /** 원문. 주면 ACC 규칙군이 활성화된다. */
  readonly original?: string;
  readonly dictionary?: Dictionary;
  readonly config?: RuleConfigInput;
}

/** RuleContext 조립: 텍스트 파싱 + 설정 병합 + 원문(선택) 파싱. */
export function createRuleContext(input: EvaluateInput): RuleContext {
  const parsed = parseText(input.raw);
  return {
    raw: input.raw,
    sentences: parsed.sentences,
    paragraphs: parsed.paragraphs,
    original: input.original !== undefined ? parseText(input.original) : undefined,
    dictionary: input.dictionary ?? EMPTY_DICTIONARY,
    config: resolveConfig(input.config),
  };
}

/**
 * 규칙들을 실행해 위반 목록을 만든다. severity 확정(발견값 → config → 규칙 기본값)과
 * excerpt 생성은 여기서 일괄 처리한다(규칙 파일의 반복을 줄인다).
 * 규칙 예외는 잡지 않는다 — rules/는 순수 계층이며 로깅·복구는 도구 핸들러(T-05)가 맡는다.
 */
export function runRules(context: RuleContext, activeRules: readonly Rule[]): Violation[] {
  const violations: Violation[] = [];
  for (const rule of activeRules) {
    for (const finding of rule.check(context)) {
      const severity =
        finding.severity ?? context.config.severity[finding.ruleId] ?? rule.defaultSeverity;
      violations.push({
        ruleId: finding.ruleId,
        severity,
        message: finding.message,
        span: finding.span,
        excerpt: makeExcerpt(context.raw, finding.span),
        suggestion: finding.suggestion,
      });
    }
  }
  return violations;
}

/** 전체 파이프라인: 파싱 → 활성 규칙 선별 → 실행 → 리포트 조립. */
export function evaluate(input: EvaluateInput, allRules: readonly Rule[]): ValidationReport {
  const context = createRuleContext(input);
  const activeRules = getActiveRules(allRules, {
    excludeRules: context.config.excludeRules,
    hasOriginal: context.original !== undefined,
  });
  return assembleReport(runRules(context, activeRules));
}
