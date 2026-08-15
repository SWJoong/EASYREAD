import type { Rule, RuleFinding } from "../types.js";

// VOC-02 불필요한 외래어/외국어: (a) loanword 사전 정확 일치 또는 (b) 로마자 2자+ 연속.
// 근거: Inclusion Europe #8(일상어) · 국내 지침 어휘(한국어 대체어 우선).
// 어절당 최대 1건, (a) 우선. 단일 로마자('A형')는 제외.
const LATIN_2PLUS = /[A-Za-z]{2,}/;

// 이메일·URL·도메인·측정단위는 '바꿀 외국어'가 아니다 → 외국어 판정에서 제외(오탐 방지).
function isTechnicalToken(t: string): boolean {
  if (t.includes("@")) return true; // 이메일(job@jobcenter.or.kr)
  if (/https?:\/\//i.test(t) || /^www\./i.test(t)) return true; // URL
  if (/[A-Za-z]\.[A-Za-z]{2,}/.test(t)) return true; // 도메인(jobcenter.or.kr)
  if (/^\d[\d.,]*[A-Za-z]+$/.test(t)) return true; // 측정단위(20kg, 3.5m)
  return false;
}

export const voc02: Rule = {
  id: "VOC-02",
  group: "VOC",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      for (const w of s.words) {
        if (isTechnicalToken(w.text)) continue; // 이메일·URL·도메인·단위는 제외
        // (a) 사전 loanword 정확 일치 — 우선
        const entry = ctx.dictionary.lookup(w.text);
        if (entry?.category === "loanword") {
          const alts = entry.alternatives.join(", ");
          findings.push({
            ruleId: "VOC-02",
            message: `'${w.text}'은(는) 외래어입니다. '${alts}'(으)로 바꾸면 더 쉽습니다.`,
            span: w.span,
            suggestion: alts,
          });
          continue; // 한 어절 1건
        }
        // (b) 로마자 2자 이상 연속 (사전 미등록 외국어)
        if (LATIN_2PLUS.test(w.text)) {
          findings.push({
            ruleId: "VOC-02",
            message: `'${w.text}'은(는) 외국어입니다. 한국어로 바꾸거나 뜻을 함께 적으세요.`,
            span: w.span,
          });
        }
      }
    }
    return findings;
  },
};
