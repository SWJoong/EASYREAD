import type { Word } from "./types.js";

/**
 * 어절 분해. 공백(공백/탭/개행)으로 나눈 토큰을 span과 함께 돌려준다.
 * 공백이 없는 URL·이메일은 자연히 1어절이 된다(03 §3 "URL은 어절 1개").
 */
export function tokenizeWords(text: string, offset = 0): Word[] {
  const words: Word[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const start = offset + m.index;
    words.push({ text: m[0], span: { start, end: start + m[0].length } });
  }
  return words;
}

/** 어절 수만 필요할 때의 경량 함수. */
export function countWords(text: string): number {
  const m = text.match(/\S+/g);
  return m === null ? 0 : m.length;
}
