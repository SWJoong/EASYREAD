import { z } from "zod";
import type { Span } from "../text/index.js";
import { DEFAULT_NOTICES } from "../messages.js";
import type { Violation } from "./types.js";

/** 초장문 입력 보호: 위반은 이 개수에서 절단하고 summary.truncated로 표시(03 §6). */
export const MAX_VIOLATIONS = 200;

const spanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

const violationSchema = z.object({
  ruleId: z.string(),
  severity: z.enum(["error", "warning", "info"]),
  message: z.string(),
  span: spanSchema,
  excerpt: z.string().optional(),
  suggestion: z.string().optional(),
});

/** validate_easy_read의 structuredContent 스키마(02 §3.1). 도구 outputSchema로도 쓴다. */
export const validationReportSchema = z.object({
  verdict: z.enum(["pass", "needs-review", "fail"]),
  summary: z.object({
    errors: z.number().int().nonnegative(),
    warnings: z.number().int().nonnegative(),
    infos: z.number().int().nonnegative(),
    byGroup: z.record(z.string(), z.number().int().nonnegative()),
    truncated: z.boolean().optional(),
  }),
  violations: z.array(violationSchema),
  notices: z.array(z.string()),
});

export type ValidationReport = z.infer<typeof validationReportSchema>;

/** 리포트·메시지에 넣을 짧은 발췌. 공백을 정리하고 maxLen에서 자른다. */
export function makeExcerpt(raw: string, span: Span, maxLen = 60): string {
  const text = raw.slice(span.start, span.end).replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen - 1)}…`;
}

export interface AssembleOptions {
  readonly notices?: readonly string[];
}

/**
 * 위반 목록 → 리포트. verdict: error≥1 → fail, warning≥1 → needs-review, 그 외 pass(03 §3).
 * summary 수치·byGroup은 절단 전 전체를 반영하고, violations 배열만 절단한다.
 */
export function assembleReport(
  violations: readonly Violation[],
  opts: AssembleOptions = {},
): ValidationReport {
  const truncated = violations.length > MAX_VIOLATIONS;
  const kept = truncated ? violations.slice(0, MAX_VIOLATIONS) : violations;

  let errors = 0;
  let warnings = 0;
  let infos = 0;
  const byGroup: Record<string, number> = {};
  for (const v of violations) {
    if (v.severity === "error") errors++;
    else if (v.severity === "warning") warnings++;
    else infos++;
    const group = v.ruleId.split("-")[0] ?? v.ruleId;
    byGroup[group] = (byGroup[group] ?? 0) + 1;
  }

  const verdict = errors > 0 ? "fail" : warnings > 0 ? "needs-review" : "pass";

  const summary: ValidationReport["summary"] = { errors, warnings, infos, byGroup };
  if (truncated) summary.truncated = true;

  return {
    verdict,
    summary,
    violations: kept.map((v) => ({ ...v })),
    notices: [...(opts.notices ?? DEFAULT_NOTICES)],
  };
}
