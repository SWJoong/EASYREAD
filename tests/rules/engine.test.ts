import {
  assembleReport,
  createRuleContext,
  defaultRuleConfig,
  evaluate,
  getActiveRules,
  makeExcerpt,
  resolveConfig,
  validationReportSchema,
} from "../../src/rules/index.js";
import type { Rule, RuleGroup, Severity } from "../../src/rules/index.js";

/** 문장마다 위반 1건을 내는 더미 규칙(엔진·리포트 검증용). */
function sentenceRule(id: string, group: RuleGroup, severity: Severity): Rule {
  return {
    id,
    group,
    defaultSeverity: severity,
    check: (ctx) => ctx.sentences.map((s) => ({ ruleId: id, message: `${id} 위반`, span: s.span })),
  };
}

describe("규칙 엔진 코어 (engine/report/registry)", () => {
  it("TC-CORE-01: 더미 규칙 결과가 리포트 스키마를 만족한다", () => {
    const report = evaluate({ raw: "첫 문장. 둘째 문장." }, [sentenceRule("SEN-99", "SEN", "warning")]);
    expect(() => validationReportSchema.parse(report)).not.toThrow();
    expect(report.violations).toHaveLength(2);
    expect(report.verdict).toBe("needs-review");
  });

  it("TC-CORE-02: verdict 판정(error→fail, warning→needs-review, 그 외 pass)", () => {
    expect(evaluate({ raw: "가." }, [sentenceRule("SEN-99", "SEN", "error")]).verdict).toBe("fail");
    expect(evaluate({ raw: "가." }, [sentenceRule("SEN-99", "SEN", "warning")]).verdict).toBe(
      "needs-review",
    );
    expect(evaluate({ raw: "가." }, [sentenceRule("VOC-99", "VOC", "info")]).verdict).toBe("pass");
    expect(evaluate({ raw: "가." }, []).verdict).toBe("pass");
  });

  it("TC-CORE-03: summary 수치와 byGroup을 규칙군별로 집계한다", () => {
    const report = evaluate({ raw: "가. 나." }, [
      sentenceRule("SEN-99", "SEN", "warning"),
      sentenceRule("VOC-99", "VOC", "info"),
    ]);
    expect(report.summary.errors).toBe(0);
    expect(report.summary.warnings).toBe(2);
    expect(report.summary.infos).toBe(2);
    expect(report.summary.byGroup).toEqual({ SEN: 2, VOC: 2 });
  });

  it("TC-CORE-04: excerpt는 공백 정리 후 maxLen에서 …로 자른다", () => {
    const long = "가".repeat(80);
    const report = evaluate({ raw: long }, [sentenceRule("SEN-99", "SEN", "info")]);
    const excerpt = report.violations[0]?.excerpt ?? "";
    expect(excerpt.length).toBeLessThanOrEqual(60);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(makeExcerpt("가  나\t다", { start: 0, end: 6 })).toBe("가 나 다");
  });

  it("TC-CORE-05: severity는 발견값 → config → 규칙 기본값 순으로 확정한다", () => {
    const override: Rule = {
      id: "SEN-99",
      group: "SEN",
      defaultSeverity: "info",
      check: (ctx) =>
        ctx.sentences.map((s) => ({ ruleId: "SEN-99", message: "m", span: s.span, severity: "error" })),
    };
    expect(evaluate({ raw: "가." }, [override]).violations[0]?.severity).toBe("error");

    const byConfig = evaluate({ raw: "가.", config: { severity: { "SEN-99": "error" } } }, [
      sentenceRule("SEN-99", "SEN", "info"),
    ]);
    expect(byConfig.violations[0]?.severity).toBe("error");

    expect(evaluate({ raw: "가." }, [sentenceRule("SEN-99", "SEN", "warning")]).violations[0]?.severity).toBe(
      "warning",
    );
  });

  it("TC-CORE-06: getActiveRules는 excludeRules와 원문 유무(ACC)를 반영한다", () => {
    const sen = sentenceRule("SEN-01", "SEN", "warning");
    const acc: Rule = {
      id: "ACC-01",
      group: "ACC",
      defaultSeverity: "error",
      requiresOriginal: true,
      check: () => [],
    };
    expect(getActiveRules([sen, acc], {}).map((r) => r.id)).toEqual(["SEN-01"]);
    expect(getActiveRules([sen, acc], { hasOriginal: true }).map((r) => r.id)).toEqual([
      "SEN-01",
      "ACC-01",
    ]);
    expect(
      getActiveRules([sen, acc], { excludeRules: ["SEN-01"], hasOriginal: true }).map((r) => r.id),
    ).toEqual(["ACC-01"]);
  });

  it("TC-CORE-07: resolveConfig는 사용자 값 우선, 미지정은 기본값", () => {
    expect(resolveConfig()).toEqual(defaultRuleConfig);
    const c = resolveConfig({ maxWordsWarning: 8, severity: { "SEN-01": "error" } });
    expect(c.maxWordsWarning).toBe(8);
    expect(c.maxWordsError).toBe(15);
    expect(c.severity).toEqual({ "SEN-01": "error" });
  });

  it("TC-CORE-08: 위반은 200건에서 절단하고 수치는 전체를 반영한다", () => {
    const many: Rule = {
      id: "SEN-99",
      group: "SEN",
      defaultSeverity: "info",
      check: () => Array.from({ length: 250 }, () => ({ ruleId: "SEN-99", message: "m", span: { start: 0, end: 1 } })),
    };
    const report = evaluate({ raw: "가." }, [many]);
    expect(report.violations).toHaveLength(200);
    expect(report.summary.truncated).toBe(true);
    expect(report.summary.infos).toBe(250);
  });

  it("TC-CORE-09: 리포트에는 항상 당사자 감수 안내(notices)가 붙는다", () => {
    const report = evaluate({ raw: "가." }, []);
    expect(report.notices.length).toBeGreaterThan(0);
    expect(report.notices[0]).toContain("감수");
  });

  it("TC-CORE-10: ACC 규칙은 원문이 있을 때만 실행된다", () => {
    let ran = false;
    const acc: Rule = {
      id: "ACC-01",
      group: "ACC",
      defaultSeverity: "error",
      requiresOriginal: true,
      check: () => {
        ran = true;
        return [];
      },
    };
    evaluate({ raw: "가." }, [acc]);
    expect(ran).toBe(false);
    evaluate({ raw: "가.", original: "원문." }, [acc]);
    expect(ran).toBe(true);
  });

  it("TC-CORE-11: createRuleContext가 문장·원문·설정·사전을 조립한다", () => {
    const ctx = createRuleContext({ raw: "가 나. 다.", original: "원문." });
    expect(ctx.sentences).toHaveLength(2);
    expect(ctx.original?.sentences).toHaveLength(1);
    expect(ctx.config.maxWordsWarning).toBe(10);
    expect(ctx.dictionary.entries).toEqual([]);
  });

  it("TC-CORE-12: 빈 위반 목록도 유효한 pass 리포트다", () => {
    const report = assembleReport([]);
    expect(report.verdict).toBe("pass");
    expect(report.summary.byGroup).toEqual({});
    expect(() => validationReportSchema.parse(report)).not.toThrow();
  });
});
