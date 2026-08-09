/**
 * text/ 계층의 자료형. 인덱스는 모두 원문(raw)에 대한 UTF-16 오프셋이다
 * (규칙 span 보고 기준과 일치. 이모지 등 서로게이트 쌍은 2로 계산된다).
 */

/** 원문 내 구간. 반열림 구간 [start, end). */
export interface Span {
  readonly start: number;
  readonly end: number;
}

/** 어절(공백으로 구분되는 토큰). URL·이메일처럼 공백이 없는 문자열은 1어절이다. */
export interface Word {
  readonly text: string;
  readonly span: Span;
}

/** 문장. 어절 목록과 문서/문단 내 위치를 함께 가진다. */
export interface Sentence {
  readonly text: string;
  readonly span: Span;
  readonly words: readonly Word[];
  /** 어절 수 (= words.length). SEN-01 등 길이 규칙이 사용. */
  readonly wordCount: number;
  /** 문서 전체 기준 문장 순번(0-based). */
  readonly index: number;
  /** 소속 문단 순번(0-based). */
  readonly paragraphIndex: number;
}

/** 문단(빈 줄로 구분되는 블록). */
export interface Paragraph {
  readonly text: string;
  readonly span: Span;
  readonly sentences: readonly Sentence[];
  readonly index: number;
}

/** parseText의 결과. sentences는 문서 순서로 평탄화된 전체 문장. */
export interface ParsedText {
  readonly raw: string;
  readonly paragraphs: readonly Paragraph[];
  readonly sentences: readonly Sentence[];
}
