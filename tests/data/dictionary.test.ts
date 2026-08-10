import { loadDictionary, parseDictionary } from "../../src/data/dictionary.js";

const dict = loadDictionary();

describe("사전 데이터·로더 (T-06)", () => {
  it("TC-DATA-01: 100건 이상이고 출처가 100% 채워져 있다", () => {
    expect(dict.entries.length).toBeGreaterThanOrEqual(100);
    expect(dict.entries.every((e) => e.source.trim().length > 0)).toBe(true);
  });

  it("TC-DATA-02: 단어 중복이 없다", () => {
    const words = dict.entries.map((e) => e.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("TC-DATA-03: terminology·idiom 항목은 뜻풀이(explanation)를 갖는다", () => {
    const missing = dict.entries.filter(
      (e) =>
        (e.category === "terminology" || e.category === "idiom") &&
        (e.explanation === undefined || e.explanation === ""),
    );
    expect(missing.map((e) => e.word)).toEqual([]);
  });

  it("TC-DATA-04: 정확 일치 조회가 동작한다", () => {
    expect(dict.lookup("구비서류")?.alternatives).toContain("필요한 서류");
    expect(dict.lookup("없는단어")).toBeUndefined();
  });

  it("TC-DATA-05: 잘못된 데이터는 상세 메시지와 함께 거부한다", () => {
    expect(() =>
      parseDictionary({
        version: "0.1.0",
        updatedAt: "2026-08-11",
        entries: [{ word: "", category: "difficult", alternatives: [], source: "" }],
      }),
    ).toThrow(/검증/);
    expect(() => parseDictionary({ entries: [] })).toThrow();
  });

  it("TC-DATA-06: 중복 단어는 거부한다", () => {
    expect(() =>
      parseDictionary({
        version: "1",
        updatedAt: "1",
        entries: [
          { word: "가", category: "difficult", alternatives: ["나"], source: "s" },
          { word: "가", category: "difficult", alternatives: ["다"], source: "s" },
        ],
      }),
    ).toThrow(/중복/);
  });
});
