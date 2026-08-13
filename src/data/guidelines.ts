import type { Rule } from "../rules/index.js";

/**
 * easyread://guidelines 리소스 본문(정적 Markdown). 자동 규칙 6개 군과 절차·정확성 원칙을 요약한다.
 * 규칙별 상세·근거는 easyread-domain 지침을, 규칙 ID 목록은 checklist(아래)를 단일 소스로 한다.
 */
export const GUIDELINES_MARKDOWN = `# 쉬운 정보(Easy-Read) 작성 지침

발달장애인·저문해력 독자를 위한 한국어 쉬운 정보 작성 원칙입니다.

## 문장 (SEN)
- 한 문장에 한 가지 정보만 담고 짧게 씁니다.
- 복문·피동·이중부정·명사화('~하는 것', '~에 대한')를 피합니다.

## 어휘 (VOC)
- 어려운 한자어·외래어 대신 쉬운 말을 씁니다.
- 전문용어·약어는 처음 나올 때 뜻을 풀어 줍니다. 지시어는 줄입니다.

## 숫자 (NUM)
- 숫자는 아라비아 숫자로, 큰 수는 만·억 단위로 끊어 씁니다.
- 상대적 날짜('익일') 대신 정확한 날짜를 씁니다.

## 구성 (STR)
- 한 단락에 한 주제만 담고, 문장이 많으면 나눕니다.
- 여러 항목 나열은 글머리표 목록으로 만듭니다.

## 표기 (TYP)
- 기호(※, ~, &, /)는 말로 풀어 씁니다.
- 괄호·쌍점(:)·쌍반점(;)을 절제합니다.

## 정확성 (ACC)
- 원문의 날짜·금액·기관명·연락처를 바꾸거나 빠뜨리지 않습니다.
- 쉽게 바꾸더라도 사실은 그대로 유지합니다.

## 절차·감수
- 변환 절차를 따르고, 결과물은 당사자 감수 전 초안임을 밝힙니다.
- 발달장애인 당사자의 확인·감수를 거쳐 최종본을 확정합니다.
`;

const GROUP_TITLE: Record<string, string> = {
  SEN: "문장",
  VOC: "어휘",
  NUM: "숫자",
  STR: "구성",
  TYP: "표기",
  ACC: "정확성",
};
const GROUP_ORDER = ["SEN", "VOC", "NUM", "STR", "TYP", "ACC"];

/**
 * easyread://guidelines/checklist 리소스 본문. 등록된 규칙(registry)에서 규칙 ID 표를 만든다.
 * validation-checklist.md가 규칙 ID의 단일 소스이며, 여기서는 라이브 등록 규칙을 반영한다.
 */
export function buildChecklistMarkdown(rules: readonly Rule[]): string {
  const lines = ["# 검증 규칙 체크리스트", "", "현재 서버에 등록된 자동/보조 검증 규칙입니다.", ""];
  for (const group of GROUP_ORDER) {
    const inGroup = rules.filter((r) => r.group === group);
    if (inGroup.length === 0) continue;
    lines.push(`## ${GROUP_TITLE[group] ?? group} (${group})`);
    for (const r of inGroup) lines.push(`- ${r.id} · 기본 심각도: ${r.defaultSeverity}`);
    lines.push("");
  }
  return lines.join("\n");
}
