import { readFileSync } from "node:fs";
import { z } from "zod";

/** 카탈로그 자원 항목(02 ADR-07 데이터모델). */
export interface ResourceEntry {
  readonly id: string;
  readonly region: string;
  readonly org_type: string;
  readonly organization: string;
  readonly title: string;
  readonly category: readonly string[];
  readonly language: string;
  readonly year: string;
  readonly url: string;
  readonly url_status: "verified" | "unverified";
  readonly description: string;
  readonly pdf_url?: string;
  readonly note?: string;
}

export interface ResourceCatalog {
  readonly meta: Record<string, unknown>;
  readonly resources: readonly ResourceEntry[];
}

const resourceEntrySchema = z.object({
  id: z.string().min(1),
  region: z.string().min(1),
  org_type: z.string().min(1),
  organization: z.string().min(1),
  title: z.string().min(1),
  category: z.array(z.string().min(1)).min(1),
  language: z.string().min(1),
  year: z.string(), // 빈 문자열 허용(연도 미상)
  url: z.string().url(),
  url_status: z.enum(["verified", "unverified"]),
  description: z.string().min(1),
  pdf_url: z.string().url().optional(),
  note: z.string().min(1).optional(),
});

const resourceFileSchema = z.object({
  meta: z.record(z.string(), z.unknown()),
  resources: z.array(resourceEntrySchema).min(1),
});

/**
 * 데이터를 zod로 검증해 ResourceCatalog로 만든다.
 * dictionary.ts와 동일 패턴: 실패 시 어떤 항목이 왜 실패했는지 담아 throw.
 */
export function parseResources(data: unknown): ResourceCatalog {
  const result = resourceFileSchema.safeParse(data);
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
 * 실패 시 throw → index.ts가 stderr로 알리고 exit 1.
 * url_status·조사시점 보존, 런타임 URL fetch 금지.
 */
export function loadResources(): ResourceCatalog {
  const url = new URL("../../assets/resources.json", import.meta.url);
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(url, "utf8"));
  } catch {
    throw new Error(`자료 카탈로그 파일을 읽을 수 없습니다: ${decodeURIComponent(url.pathname)}`);
  }
  return parseResources(json);
}
