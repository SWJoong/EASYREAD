import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { rules } from "../rules/index.js";

// section → 규칙 그룹. '전체'는 모든 그룹, '절차'(PROC)는 수동 항목이라 등록 규칙이 없다.
const SECTION_GROUP: Record<string, string> = {
  문장: "SEN",
  어휘: "VOC",
  숫자: "NUM",
  구성: "STR",
  표기: "TYP",
  정확성: "ACC",
};

// 영역별 지침 요약(Markdown). validation-checklist의 규칙을 사람이 읽을 안내로 옮긴 것.
const SECTION_CONTENT: Record<string, string> = {
  전체: "# 쉬운 정보 작성 지침\n\n문장·어휘·숫자·구성·표기·정확성 영역의 규칙을 지켜 쉽게 쓰세요. 각 영역은 개별 조회할 수 있습니다.",
  문장: "# 문장 (SEN)\n\n- 한 문장에 한 가지 정보만 담고 짧게 씁니다.\n- 복문·피동·이중부정·명사화(‘~하는 것’)를 피합니다.",
  어휘: "# 어휘 (VOC)\n\n- 어려운 한자어·외래어 대신 쉬운 말을 씁니다.\n- 전문용어·약어는 처음 나올 때 뜻을 풀어 줍니다. 지시어는 줄입니다.",
  숫자: "# 숫자 (NUM)\n\n- 숫자는 아라비아 숫자로, 큰 수는 만/억 단위로 끊어 씁니다.\n- 상대적 날짜(‘익일’) 대신 정확한 날짜를 씁니다.",
  구성: "# 구성 (STR)\n\n- 한 단락에 한 주제만 담고, 문장이 많으면 나눕니다.\n- 여러 항목 나열은 글머리표 목록으로 만듭니다.",
  표기: "# 표기 (TYP)\n\n- 기호(※, ~, &, /)는 말로 풀어 씁니다.\n- 괄호·쌍점(:)·쌍반점(;)을 절제합니다.",
  절차: "# 절차 (PROC)\n\n- 당사자(발달장애인)가 직접 확인·감수하도록 합니다. 자동 검사가 아닌 점검 항목입니다.",
  정확성: "# 정확성 (ACC)\n\n- 원문의 날짜·금액·기관명·연락처를 바꾸거나 빠뜨리지 않습니다.\n- 쉽게 바꾸더라도 사실은 그대로 유지합니다.",
};

function ruleIdsFor(section: string): string[] {
  if (section === "전체") return rules.map((r) => r.id);
  const group = SECTION_GROUP[section];
  if (group === undefined) return []; // 절차(PROC) 등 등록 규칙이 없는 영역
  return rules.filter((r) => r.group === group).map((r) => r.id);
}

/**
 * get_guidelines 도구를 등록한다(FR-04, 계약: 02 §3.1).
 * ruleIds는 등록된 규칙(registry)에서 파생 — validation-checklist가 규칙 ID의 단일 소스다.
 */
export function registerGuidelinesTool(server: McpServer): void {
  server.registerTool(
    "get_guidelines",
    {
      title: "작성 지침 보기",
      description:
        "쉬운 정보 작성 지침을 영역별로 돌려준다(문장·어휘·숫자·구성·표기·절차·정확성 또는 전체). 어떤 규칙을 지켜야 하는지 확인할 때 쓴다.",
      inputSchema: {
        section: z
          .enum(["전체", "문장", "어휘", "숫자", "구성", "표기", "절차", "정확성"])
          .describe("조회할 지침 영역."),
      },
      outputSchema: z.object({ section: z.string(), ruleIds: z.array(z.string()) }).shape,
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    ({ section }) => {
      const ruleIds = ruleIdsFor(section);
      const content = SECTION_CONTENT[section] ?? `# ${section}`;
      return {
        content: [{ type: "text", text: content }],
        structuredContent: { section, ruleIds },
      };
    },
  );
}
