import type { Paragraph, ParsedText, Sentence } from "./types.js";
import { splitParagraphSpans } from "./paragraphs.js";
import { splitSentenceSpans } from "./sentences.js";
import { sliceSpan } from "./spans.js";
import { tokenizeWords } from "./words.js";

/**
 * 원문을 문단·문장·어절로 분해한다. text/ 계층의 진입점.
 * 규칙 엔진(rules/)은 이 결과(ParsedText)를 입력으로 받는다.
 * 빈 문자열·공백만 있는 입력은 빈 문단/문장 목록을 돌려준다(오류 아님).
 */
export function parseText(raw: string): ParsedText {
  const paragraphs: Paragraph[] = [];
  const sentences: Sentence[] = [];
  let sentenceIndex = 0;

  splitParagraphSpans(raw).forEach((pSpan, pIdx) => {
    const pText = sliceSpan(raw, pSpan);
    const pSentences: Sentence[] = splitSentenceSpans(pText, pSpan.start).map((sSpan) => {
      const text = sliceSpan(raw, sSpan);
      const words = tokenizeWords(text, sSpan.start);
      const sentence: Sentence = {
        text,
        span: sSpan,
        words,
        wordCount: words.length,
        index: sentenceIndex++,
        paragraphIndex: pIdx,
      };
      sentences.push(sentence);
      return sentence;
    });
    paragraphs.push({ text: pText, span: pSpan, sentences: pSentences, index: pIdx });
  });

  return { raw, paragraphs, sentences };
}

export type { Span, Word, Sentence, Paragraph, ParsedText } from "./types.js";
export { splitSentenceSpans } from "./sentences.js";
export { splitParagraphSpans } from "./paragraphs.js";
export { tokenizeWords, countWords } from "./words.js";
export { sliceSpan, spanLength } from "./spans.js";
