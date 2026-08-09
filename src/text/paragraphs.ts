import type { Span } from "./types.js";

// 빈 줄(공백만 있는 줄 포함) 하나 이상을 문단 구분자로 본다.
const SEPARATOR = /\n[ \t\r]*\n/g;

function trimSpan(raw: string, start: number, end: number): Span {
  let s = start;
  let e = end;
  while (s < e && /\s/.test(raw[s] as string)) s++;
  while (e > s && /\s/.test(raw[e - 1] as string)) e--;
  return { start: s, end: e };
}

/**
 * 원문을 문단 Span 목록으로 나눈다. 빈 문단은 제외한다.
 * 인덱스는 정규화하지 않은 원문 기준이므로 CRLF 입력에서도 span이 정확하다.
 */
export function splitParagraphSpans(raw: string): Span[] {
  const spans: Span[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  SEPARATOR.lastIndex = 0;
  while ((m = SEPARATOR.exec(raw)) !== null) {
    spans.push(trimSpan(raw, last, m.index));
    last = m.index + m[0].length;
  }
  spans.push(trimSpan(raw, last, raw.length));
  return spans.filter((s) => s.end > s.start);
}
