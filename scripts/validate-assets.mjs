#!/usr/bin/env node
// 번들 데이터 자산(assets/dictionary.json·resources.json)을 zod 로더로 검증하는 CI·릴리스 게이트.
// 런타임과 동일한 로더(dist/data/*)를 재사용한다 — 스키마 정의를 한 곳(src)에만 둔다.
// 사용 전 `npm run build` 필요(dist 산출물 로드). 실패 시 비정상 종료(exit 1)로 파이프라인 차단.
import { loadDictionary } from "../dist/data/dictionary.js";
import { loadResources } from "../dist/data/resources.js";

try {
  const dictionary = loadDictionary();
  const catalog = loadResources();
  const total = catalog.meta?.counts?.total;
  if (total !== catalog.resources.length) {
    throw new Error(`카탈로그 meta.counts.total(${total}) != 실제 건수(${catalog.resources.length})`);
  }
  console.error(`[validate-assets] OK — 사전 ${dictionary.entries.length}건 · 카탈로그 ${catalog.resources.length}건`);
} catch (err) {
  console.error(`[validate-assets] 실패: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
