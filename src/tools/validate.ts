import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { validate, validationReportSchema } from "../rules/index.js";
import type { ValidationReport } from "../rules/index.js";

const MAX_CHARS = 50_000;

const VERDICT_LABEL: Record<ValidationReport["verdict"], string> = {
  pass: "통과",
  "needs-review": "검토 필요",
  fail: "수정 필요",
};
const SEVERITY_LABEL = { error: "오류", warning: "경고", info: "참고" } as const;

/** 리포트를 사람이 읽을 한국어 요약 텍스트로 만든다(content용). */
function formatReport(report: ValidationReport): string {
  const { summary } = report;
  const lines = [
    `판정: ${VERDICT_LABEL[report.verdict]} (오류 ${summary.errors} · 경고 ${summary.warnings} · 참고 ${summary.infos})`,
  ];
  if (report.violations.length === 0) {
    lines.push("발견된 문제가 없습니다.");
  } else {
    for (const v of report.violations) {
      const excerpt = v.excerpt !== undefined && v.excerpt !== "" ? ` ("${v.excerpt}")` : "";
      lines.push(`- [${SEVERITY_LABEL[v.severity]}] ${v.ruleId}: ${v.message}${excerpt}`);
    }
    if (summary.truncated === true) lines.push("… 문제가 많아 일부만 표시했습니다.");
  }
  lines.push("", ...report.notices);
  return lines.join("\n");
}

/**
 * validate_easy_read 도구를 서버에 등록한다(FR-01·07·10, 계약: 02 §3.1).
 * 입력 파싱은 zod가, 규칙 실행·리포트는 rules/가 담당한다(도구는 조립만).
 */
export function registerValidateTool(server: McpServer): void {
  server.registerTool(
    "validate_easy_read",
    {
      title: "쉬운 정보 검증",
      description:
        "한국어 텍스트가 쉬운 정보(Easy-Read) 작성 지침을 지키는지 검사한다. 쉬운 정보 초안을 만들었거나 검토할 때 반드시 호출한다. 원문(original)을 함께 주면 날짜·금액 등 사실 보존까지 검사한다.",
      inputSchema: {
        text: z
          .string()
          .min(1, { message: "검사할 텍스트를 입력하세요." })
          .max(MAX_CHARS, {
            message: "텍스트가 너무 깁니다(최대 50,000자). 나눠서 검사해 주세요.",
          })
          .refine((s) => s.trim().length > 0, { message: "빈 텍스트입니다. 검사할 내용을 입력하세요." })
          .describe("검사할 쉬운 정보 텍스트(1~50,000자). span은 UTF-16 인덱스 기준."),
        original: z
          .string()
          .max(MAX_CHARS)
          .optional()
          .describe("원문. 함께 주면 사실 보존(날짜·금액 등, ACC 규칙군)까지 검사한다."),
        config: z
          .object({
            maxWordsWarning: z.number().int().positive().optional().describe("문장 길이 경고 임계값(기본 10)."),
            maxWordsError: z.number().int().positive().optional().describe("문장 길이 오류 임계값(기본 15)."),
            excludeRules: z.array(z.string()).optional().describe("끌 규칙 ID 목록(예: [\"SEN-02\"])."),
          })
          .optional(),
      },
      outputSchema: validationReportSchema.shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ text, original, config }) => {
      try {
        const report = validate({ raw: text, original, config });
        return {
          content: [{ type: "text", text: formatReport(report) }],
          structuredContent: report,
        };
      } catch {
        // 내부 예외: 스택·입력 본문을 응답에 싣지 않는다(NFR-03, 03 §6).
        return {
          content: [{ type: "text", text: "서버 내부 오류가 생겼습니다. 잠시 후 다시 시도해 주세요." }],
          isError: true,
        };
      }
    },
  );
}
