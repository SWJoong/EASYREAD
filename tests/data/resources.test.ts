import { loadResources, parseResources } from "../../src/data/resources.js";
import type { Catalog, ResourceEntry } from "../../src/data/resources.js";

/**
 * T-14 — Easy-Read 자료 카탈로그 로더 골든 테스트 (ADR-07).
 *
 * 구현 계약 (Instance-U가 src/data/resources.ts로 구현 — dictionary.ts 패턴):
 *  - `assets/resources.json`(66건 = 원본 62 + ADR-08 벤치마크 4: 소소한소통 가이드라인 1.0·미국·캐나다·NZ)을 기동 시 1회 zod 검증해 로드.
 *  - `parseResources(data)`: 검증 실패 시 **어떤 항목이 왜** 실패했는지 담아 throw. id 중복 거부.
 *  - `loadResources()`: 파일 I/O + parseResources.
 *  - 타입 export: `Catalog`(= { meta, resources }), `ResourceEntry`.
 *  - resource 필수 필드: id·region·org_type·organization·title·category(비어있지 않은 배열)
 *      ·language·year(빈 문자열 허용)·url·url_status·description. 옵션: note·pdf_url.
 *  - **런타임 URL fetch 금지**(ADR-07) — url은 참조 문자열로만 보존.
 */

const cat: Catalog = loadResources();

describe("자료 카탈로그 데이터·로더 (T-14)", () => {
  it("TC-DATA-14-01: 66건이고 필수 필드가 100% 채워져 있다", () => {
    expect(cat.resources.length).toBe(66);
    expect(
      cat.resources.every(
        (r: ResourceEntry) => r.id && r.title && r.url && r.description && r.organization && r.region,
      ),
    ).toBe(true);
  });

  it("TC-DATA-14-02: id 중복이 없다", () => {
    const ids = cat.resources.map((r: ResourceEntry) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("TC-DATA-14-03: url_status는 verified|unverified 뿐이다", () => {
    expect(
      cat.resources.every((r: ResourceEntry) => r.url_status === "verified" || r.url_status === "unverified"),
    ).toBe(true);
  });

  it("TC-DATA-14-04: category는 알려진 값의 비어있지 않은 배열이다", () => {
    const known = new Set(["guideline_standard", "example", "law_policy", "portal_center"]);
    expect(
      cat.resources.every(
        (r: ResourceEntry) =>
          Array.isArray(r.category) && r.category.length > 0 && r.category.every((c: string) => known.has(c)),
      ),
    ).toBe(true);
  });

  it("TC-DATA-14-05: language는 ko|en|multi 뿐이다", () => {
    expect(cat.resources.every((r: ResourceEntry) => ["ko", "en", "multi"].includes(r.language))).toBe(true);
  });

  it("TC-DATA-14-06: meta.counts.total이 실제 건수와 일치한다", () => {
    expect(cat.meta.counts.total).toBe(cat.resources.length);
  });

  it("TC-DATA-14-07: 잘못된 데이터는 상세 메시지와 함께 거부한다", () => {
    expect(() =>
      parseResources({ meta: { counts: { total: 1 } }, resources: [{ id: "", title: "" }] }),
    ).toThrow(/검증/);
    expect(() => parseResources({ resources: [] })).toThrow();
  });

  it("TC-DATA-14-08: 중복 id는 거부한다", () => {
    const one = cat.resources[0];
    expect(() =>
      parseResources({ meta: { counts: { total: 2 } }, resources: [one, one] }),
    ).toThrow(/중복/);
  });

  it("TC-DATA-14-09: 소소한소통 가이드라인 1.0 + 벤치마크 3건이 카탈로그에 있다 (ADR-08)", () => {
    const urls = cat.resources.map((r: ResourceEntry) => r.url);
    const has = (needle: string) => urls.some((u: string) => u.includes(needle));
    // 소소한소통 쉬운정보 가이드라인 1.0 (국내 실무 1차 기준)
    expect(has("sosoeasyreadguideline.notion.site")).toBe(true);
    expect(cat.resources.some((r: ResourceEntry) => r.organization.includes("소소한소통"))).toBe(true);
    // 해외 정부 Plain Language 벤치마크
    expect(has("digital.gov")).toBe(true); // 미국
    expect(has("accessible.canada.ca")).toBe(true); // 캐나다
    expect(has("digital.govt.nz")).toBe(true); // 뉴질랜드
    // 회귀: 영국 NHS 접근가능정보표준은 기존에도 수록돼 있어야 한다
    expect(has("england.nhs.uk")).toBe(true);
  });
});
