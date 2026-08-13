import type { Rule, RuleFinding } from "../types.js";

// SEN-07 명사화·긴 수식: '~하는 것'·'~의 여부'·'~에 대한/관한/통한'·'~함으로써' 같은
// 명사화·관형 수식을 어절 경계로 탐지해 문장당 1건 경고. 동사가 드러나는 짧은 문장을 권한다.
// 보조 규칙(오탐 있음 → warning). 형태소 분석 도입 시 정밀화(backlog).
// 근거: 소소한소통 「쉬운정보 가이드라인 1.0」 §8.3.6 · Inclusion Europe #14(짧고 간결).

/** 어절 양끝의 문장부호·따옴표·괄호를 떼어 핵심만 남긴다(마커 판정용). */
function core(text: string): string {
  return text.replace(/^[^\p{L}\p{N}]+/u, "").replace(/[^\p{L}\p{N}]+$/u, "");
}

/** 관형형 종결인가: '는/은/을'로 끝나거나 종성이 ㄴ·ㄹ인 음절로 끝난다('갈 것'·'만들 것'). */
function endsAdnominal(word: string): boolean {
  if (word.endsWith("는") || word.endsWith("은") || word.endsWith("을")) return true;
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false; // 한글 음절이 아님
  const jong = (code - 0xac00) % 28;
  return jong === 4 /* ㄴ */ || jong === 8 /* ㄹ */;
}

/** '~에 대한' 류: '대한민국' 같은 다른 어절을 잡지 않도록 정확 일치로만 판정. */
const ADNOMINAL_EXACT = new Set(["대한", "관한", "통한", "대하여", "관하여"]);
const BY_DOING_ENDINGS = ["함으로써", "됨으로써", "음으로써"];

export const sen07: Rule = {
  id: "SEN-07",
  group: "SEN",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      const cores = s.words.map((w) => core(w.text));
      const hasMarker = cores.some((c, i) => {
        // (a) 명사화 '것': 관형형 어절 바로 뒤에 '것…' 어절이 온다.
        const next = cores[i + 1];
        if (next !== undefined && endsAdnominal(c) && next.startsWith("것")) return true;
        // (b) '여부…'로 시작하는 어절.
        if (c.startsWith("여부")) return true;
        // (c) '~에 대한/관한/통한/대하여/관하여' (정확 일치).
        if (ADNOMINAL_EXACT.has(c)) return true;
        // (d) '함으로써/됨으로써/음으로써'로 끝나는 어절.
        if (BY_DOING_ENDINGS.some((e) => c.endsWith(e))) return true;
        return false;
      });
      if (hasMarker) {
        findings.push({
          ruleId: "SEN-07",
          message: "명사화·긴 수식 표현이 있습니다. 동사를 살려 짧게 풀어 쓰세요.",
          span: s.span,
          suggestion:
            "'~하는 것'·'~의 여부'·'~에 대한' 대신 동사를 드러내세요. 예: '확인하는 것이 필요합니다' → '확인하세요'.",
        });
      }
    }
    return findings;
  },
};
