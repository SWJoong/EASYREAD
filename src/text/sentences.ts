import type { Span } from "./types.js";

/**
 * 한국어 문장 분리기 (정규식·상태머신 휴리스틱, v0.1).
 *
 * 이 모듈은 의도적으로 격리되어 있다 — 나중에 형태소 분석기 기반으로 교체할 수 있게(ADR-04).
 * 상위 계층은 splitSentenceSpans의 입출력 계약(문자열 → Span[])에만 의존한다.
 *
 * 경계 규칙:
 * - 종결부호: . ! ? … 。 ！ ？ 뒤에서 문장을 나눈다.
 * - 숫자 마침표: 숫자 바로 뒤의 '.'은 종결부호가 아니다(소수점·날짜 "2026. 8. 9."·버전·순번).
 * - 따옴표/괄호 안의 종결부호로는 나누지 않는다. 닫는 기호 앞이 종결부호이고
 *   그 뒤가 공백/끝이면 그 지점에서 나눈다(예: "신청하세요." | 다음). 뒤에 조사가 붙으면
 *   나누지 않는다(예: "안녕하세요."라고 말했다. → 한 문장).
 * - 개행(\n)은 항상 경계로 본다(문장부호 없는 제목·목록 대응).
 */

const TERMINATORS = new Set([".", "!", "?", "…", "。", "！", "？"]);

const OPEN_TO_CLOSE = new Map<string, string>([
  ["“", "”"], // “ ”
  ["‘", "’"], // ‘ ’
  ["「", "」"], // 「 」
  ["『", "』"], // 『 』
  ["《", "》"], // 《 》
  ["〈", "〉"], // 〈 〉
  ["(", ")"],
  ["（", "）"], // （ ）
  ["[", "]"],
  ["【", "】"], // 【 】
  ["{", "}"],
  ["〔", "〕"], // 〔 〕
]);
const CLOSE_CHARS = new Set(OPEN_TO_CLOSE.values());
const STRAIGHT_QUOTES = new Set(['"', "'"]);

function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= "0" && ch <= "9";
}

function isSpace(ch: string | undefined): boolean {
  return ch !== undefined && /\s/.test(ch);
}

/**
 * 문단 텍스트를 문장 Span 목록으로 나눈다.
 * @param text   문단(또는 전체) 문자열
 * @param offset 원문 기준 시작 오프셋(반환 span에 더해진다)
 */
export function splitSentenceSpans(text: string, offset = 0): Span[] {
  const spans: Span[] = [];
  const stack: string[] = []; // 방향성 따옴표·괄호 닫힘 대기
  const straightOpen = new Map<string, boolean>([
    ['"', false],
    ["'", false],
  ]);
  let start = 0;

  const push = (end: number): void => {
    let s = start;
    let e = end;
    while (s < e && isSpace(text[s])) s++;
    while (e > s && isSpace(text[e - 1])) e--;
    if (e > s) spans.push({ start: offset + s, end: offset + e });
    start = end;
  };

  const suppressed = (): boolean =>
    stack.length > 0 || straightOpen.get('"') === true || straightOpen.get("'") === true;

  // 닫는 따옴표/괄호(index i) 직전이 종결부호이고 뒤가 공백/끝이면 경계로 삼는다.
  const maybeCloseBoundary = (i: number): void => {
    const prev = text[i - 1];
    if (prev === undefined || !TERMINATORS.has(prev)) return;
    if (prev === "." && isDigit(text[i - 2])) return; // 숫자 마침표
    const next = text[i + 1];
    if (next === undefined || isSpace(next)) push(i + 1);
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i] as string;

    if (ch === "\n") {
      push(i + 1);
      continue;
    }
    if (OPEN_TO_CLOSE.has(ch)) {
      stack.push(OPEN_TO_CLOSE.get(ch) as string);
      continue;
    }
    if (CLOSE_CHARS.has(ch)) {
      if (stack.length > 0 && stack[stack.length - 1] === ch) stack.pop();
      maybeCloseBoundary(i);
      continue;
    }
    if (STRAIGHT_QUOTES.has(ch)) {
      const wasOpen = straightOpen.get(ch) === true;
      straightOpen.set(ch, !wasOpen);
      if (wasOpen) maybeCloseBoundary(i); // 닫히는 경우
      continue;
    }
    if (TERMINATORS.has(ch)) {
      if (ch === "." && isDigit(text[i - 1])) continue; // 숫자 마침표
      if (suppressed()) continue; // 따옴표/괄호 안
      // 연속 종결부호 흡수: "...", "?!" 등
      let j = i;
      while (
        j + 1 < text.length &&
        TERMINATORS.has(text[j + 1] as string) &&
        !(text[j + 1] === "." && isDigit(text[j]))
      ) {
        j++;
      }
      push(j + 1);
      i = j;
      continue;
    }
  }

  push(text.length); // 종결부호 없는 꼬리 문장
  return spans;
}
