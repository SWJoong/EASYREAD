import { readFileSync } from "node:fs";
import { z } from "zod";

/**
 * T-14 — Easy-Read 자료 카탈로그 로더 (02 ADR-07 데이터모델).
 * dictionary.ts와 동일 패턴: 기동 시 1회 zod 검증, url_status·조사시점 보존, 런타임 URL fetch 금지.
 * 타입은 zod 스키마에서 추론(z.infer)해 검증 결과와 export 타입이 항상 일치하도록 한다.
 */

/** 자원 항목 스키마. 필수 필드 + 옵션(pdf_url·note). */
const resourceEntrySchema = z.object({
  id: z.string().min(1),
  region: z.string().min(1),
  org_type: z.string().min(1),
  organization: z.string().min(1),
  title: z.string().min(1),
  category: z.array(z.enum(["guideline_standard", "example", "law_policy", "portal_center"])).min(1),
  language: z.enum(["ko", "en", "multi"]),
  year: z.string(), // 빈 문자열 허용(연도 미상)
  url: z.string().url(),
  url_status: z.enum(["verified", "unverified"]),
  description: z.string().min(1),
  pdf_url: z.string().url().optional(),
  note: z.string().min(1).optional(),
  /**
   * 원출처 저작물의 재사용 조건 분류(참고용). 본 카탈로그는 서지정보·자체 요약만 수록하고
   * 원문을 전재하지 않는다(NFR-04). "확인 필요(미검증)" 항목의 최종 이용조건은 개별 확인 대상이며
   * 법적 확인은 별도로 진행한다. 대한민국 법령은 저작권법 제7조에 따라 보호 대상이 아니다.
   */
  license: z.string().min(1).optional(),
});

/** meta: counts.total만 타입 고정, 나머지 라벨·집계는 passthrough로 원형 보존. */
const catalogMetaSchema = z
  .object({
    counts: z.object({ total: z.number() }).passthrough(),
  })
  .passthrough();

const catalogSchema = z.object({
  meta: catalogMetaSchema,
  resources: z.array(resourceEntrySchema).min(1),
});

export type ResourceEntry = z.infer<typeof resourceEntrySchema>;
export type Catalog = z.infer<typeof catalogSchema>;

/**
 * 데이터를 zod로 검증해 Catalog로 만든다.
 * 실패 시 어떤 항목이 왜 실패했는지 담아 throw(dictionary.ts 패턴). id 중복은 별도로 거부.
 */
export function parseResources(data: unknown): Catalog {
  const result = catalogSchema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues
      .slice(0, 8)
      .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`자료 카탈로그 검증에 실패했습니다:\n${detail}`);
  }
  const seen = new Set<string>();
  for (const entry of result.data.resources) {
    if (seen.has(entry.id)) throw new Error(`카탈로그에 중복된 ID가 있습니다: "${entry.id}"`);
    seen.add(entry.id);
  }
  return result.data;
}

/**
 * assets/resources.json을 기동 시 1회 읽어 검증한다(ADR-07).
 * 실패 시 throw → index.ts가 stderr로 알리고 exit 1. 런타임 URL fetch 금지.
 */
export function loadResources(): Catalog {
  const url = new URL("../../assets/resources.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`자료 카탈로그 파일을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseResources(json);
}
