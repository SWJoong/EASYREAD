import type { Span } from "./types.js";

/** 원문에서 span 구간의 문자열을 잘라낸다. */
export function sliceSpan(raw: string, span: Span): string {
  return raw.slice(span.start, span.end);
}

/** span의 길이(UTF-16 단위). */
export function spanLength(span: Span): number {
  return span.end - span.start;
}
