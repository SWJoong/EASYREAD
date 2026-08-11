import type { Rule, RuleFinding } from "../types.js";

// TYP-01 풀어 쓰지 않은 기호: ※, ~, &, / 등 → 말로 풀어 쓰기. 자동(warning).
// 근거: Inclusion Europe #19(기호 풀어쓰기) · 국내 지침 표기.
const SYMBOL_MAP: ReadonlyMap<string, string> = new Map([
  ["※", "'참고' 또는 '알아두세요'"],
  ["~", "'부터 … 까지'"],
  ["&", "'그리고' 또는 '및'"],
  ["/", "'또는'이나 풀어서"],
]);

const SYMBOL_PATTERN = /[※~&/]/g;

export const typ01: Rule = {
  id: "TYP-01",
  group: "TYP",
  defaultSeverity: "warning",
  check(ctx) {
    const findings: RuleFinding[] = [];
    for (const s of ctx.sentences) {
      SYMBOL_PATTERN.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = SYMBOL_PATTERN.exec(s.text)) !== null) {
        // URL 안의 / 은 제외 (http:// 등)
        if (m[0] === "/" && s.text.slice(Math.max(0, m.index - 6), m.index + 1).includes("://")) continue;
        const start = s.span.start + m.index;
        const hint = SYMBOL_MAP.get(m[0]) ?? "풀어서";
        findings.push({
          ruleId: "TYP-01",
          message: `기호 '${m[0]}'을(를) 말로 풀어 쓰세요.`,
          span: { start, end: start + 1 },
          suggestion: `'${m[0]}' 대신 ${hint} 쓰세요.`,
        });
      }
    }
    return findings;
  },
};
