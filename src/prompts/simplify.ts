import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const DEFAULT_AUDIENCE = "발달장애인 등 낮은 문해력 독자";

/**
 * simplify-text 프롬프트를 등록한다(FR-05·06, 계약: 02 §3.2).
 * 생성 메시지에 ① 변환 절차 ② 정확성 원칙 ③ 당사자 감수 전 초안 고지 3요소를 담는다.
 */
export function registerSimplifyPrompt(server: McpServer): void {
  server.registerPrompt(
    "simplify-text",
    {
      title: "쉬운 정보로 바꾸기",
      description: "원문을 쉬운 정보(Easy-Read)로 바꾸는 지시를 만든다. 변환 절차·정확성 원칙·감수 전 초안 고지를 포함한다.",
      argsSchema: {
        text: z.string().min(1).describe("쉽게 바꿀 원문."),
        audience: z.string().optional().describe(`대상 독자(기본: ${DEFAULT_AUDIENCE}).`),
      },
    },
    ({ text, audience }) => {
      const reader = audience !== undefined && audience.trim().length > 0 ? audience : DEFAULT_AUDIENCE;
      const message = [
        `당신은 한국어 쉬운 정보(Easy-Read) 변환 전문가입니다. 아래 원문을 "${reader}"가 이해하기 쉽게 바꾸세요.`,
        "",
        "## 변환 절차",
        "1. 핵심 메시지와 꼭 필요한 정보를 먼저 정리합니다.",
        "2. 한 문장에 한 가지 정보만 담아 짧게 씁니다.",
        "3. 어려운 낱말은 lookup_easy_word로 쉬운 말을 찾아 바꿉니다.",
        "4. 숫자·날짜·금액은 쉽게 쓰되 값은 원문과 똑같이 둡니다.",
        "5. 구성을 정리하고 필요하면 그림·목록을 제안합니다.",
        "6. validate_easy_read로 검사하고 경고를 고칩니다.",
        "",
        "## 정확성 원칙",
        "쉽게 바꾸더라도 날짜·금액·기관명·연락처 같은 사실은 절대 바꾸거나 빼지 마세요.",
        "",
        "## 감수 고지",
        "이 결과물은 당사자 감수 전 초안입니다. 발달장애인 당사자의 확인·감수를 거쳐 최종본을 확정하세요.",
        "",
        "## 원문",
        text,
      ].join("\n");
      return { messages: [{ role: "user", content: { type: "text", text: message } }] };
    },
  );
}
