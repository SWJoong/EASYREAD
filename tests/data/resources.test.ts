import { loadResources, parseResources } from "../../src/data/resources.js";

/**
 * T-14 — Easy-Read 자료 카탈로그 로더 골든 테스트 (ADR-07).
 *
 * 구현 계약 (Instance-U가 src/data/resources.ts로 구현 — dictionary.ts 패턴):
 *  - `assets/resources.json`(62건, 사용자 업로드 원본)을 기동 시 1회 zod 검증해 로드.
 *  - `parseResources(data)`: 검증 실패 시 **어떤 항목이 왜** 실패했는지 담아 throw. id 중복 거부.
 *  - `loadResources()`: 파일 I/O + parseResources.
 *  - resource 필수 필드: id·region·org_type·organization·title·category(비어있지 않은 배열)
 *      ·language·year(빈 문자열 허용)·url·url_status·description. 옵션: note·pdf_url.
 *  - **런타임 URL fetch 금지**(ADR-07) — url은 참조 문자열로만 보존.
 */

const cat = loadResources();

describe("자료 카탈로그 데이터·로더 (T-14)", () => {
  it("TC-DATA-14-01: 62건이고 필수 필드가 100% 채워져 있다", () => {
    expect(cat.resources.length).toBe(62);
    expect(
      cat.resources.every(
        (r) => r.id && r.title && r.url && r.description && r.organization && r.region,
      ),
    ).toBe(true);
  });

  it("TC-DATA-14-02: id 중복이 없다", () => {
    const ids = cat.resources.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("TC-DATA-14-03: url_status는 verified|unverified 뿐이다", () => {
    expect(cat.resources.every((r) => r.url_status === "verified" || r.url_status === "unverified")).toBe(true);
  });

  it("TC-DATA-14-04: category는 알려진 값의 비어있지 않은 배열이다", () => {
    const known = new Set(["guideline_standard", "example", "law_policy", "portal_center"]);
    expect(
      cat.resources.every(
        (r) => Array.isArray(r.category) && r.category.length > 0 && r.category.every((c) => known.has(c)),
      ),
    ).toBe(true);
  });

  it("TC-DATA-14-05: language는 ko|en|multi 뿐이다", () => {
    expect(cat.resources.every((r) => ["ko", "en", "multi"].includes(r.language))).toBe(true);
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
});
