import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * T-12 · 릴리스 준비성 계약 (배포 파이프라인, WBS T-12 / docs/plan/05). [일부 HANDOFF→U]
 * npm publish·npx 설치가 성립하는 최소 조건을 package.json·번들 파일로 고정한다(회귀 가드).
 * 현재 대부분 green(회귀 가드 역할), LICENSE 파일만 red → U(T-12·DevOps)가 생성하면 green.
 * 참고: 실제 publish 설정(CI publish 워크플로·MCPB 패키징)은 U의 T-12 본작업.
 */
const root = (p: string): string => fileURLToPath(new URL(`../../${p}`, import.meta.url));

interface Pkg {
  name: string;
  version: string;
  type?: string;
  license?: string;
  author?: string;
  homepage?: string;
  repository?: { type?: string; url?: string };
  bugs?: { url?: string };
  bin?: Record<string, string>;
  files?: string[];
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  publishConfig?: { access?: string };
}
const pkg = JSON.parse(readFileSync(root("package.json"), "utf8")) as Pkg;

describe("릴리스 준비성 (package.json·번들, T-12)", () => {
  it("TC-REL-01: 패키지 식별 — name·semver version·MIT license·ESM type", () => {
    expect(pkg.name).toBe("easyread-mcp");
    expect(pkg.version).toMatch(/^\d+\.\d+\.\d+/);
    expect(pkg.license).toBe("MIT");
    expect(pkg.type).toBe("module");
  });

  it("TC-REL-02: npx 실행 — bin이 dist/index.js를 가리키고 소스 엔트리에 shebang이 있다", () => {
    expect(pkg.bin?.["easyread-mcp"]).toBe("dist/index.js");
    const entry = readFileSync(root("src/index.ts"), "utf8");
    expect(entry.startsWith("#!/usr/bin/env node")).toBe(true);
  });

  it("TC-REL-03: files에 런타임 산출물(dist)·데이터(assets)·문서가 포함된다", () => {
    const files = pkg.files ?? [];
    for (const f of ["dist", "assets", "README.md", "LICENSE"]) {
      expect(files).toContain(f);
    }
  });

  it("TC-REL-04: 런타임 의존성은 정확히 2개(@modelcontextprotocol/sdk·zod)", () => {
    expect(Object.keys(pkg.dependencies ?? {}).sort()).toEqual([
      "@modelcontextprotocol/sdk",
      "zod",
    ]);
  });

  it("TC-REL-05: 배포 설정 — engines.node·prepublishOnly 빌드·publishConfig public", () => {
    expect(pkg.engines?.node).toBeDefined();
    expect(pkg.scripts?.prepublishOnly ?? "").toContain("build");
    expect(pkg.publishConfig?.access).toBe("public");
  });

  it("TC-REL-06: files가 참조하는 문서 파일이 실제로 존재한다 (README·LICENSE)", () => {
    expect(existsSync(root("README.md"))).toBe(true);
    // ↓ RED [HANDOFF→U]: license:"MIT"·files 참조에 대응하는 LICENSE 파일이 없다. U(T-12) 생성 대기.
    expect(existsSync(root("LICENSE"))).toBe(true);
  });

  it("TC-REL-07: 번들 데이터가 존재한다 (dictionary·resources)", () => {
    expect(existsSync(root("assets/dictionary.json"))).toBe(true);
    expect(existsSync(root("assets/resources.json"))).toBe(true);
  });

  it("TC-REL-08: provenance 배포 메타 — repository.url·bugs·homepage·author 존재", () => {
    // publishConfig.provenance + release.yml의 `npm publish --provenance`는 repository.url이 있어야
    // provenance 증명을 생성·게시할 수 있다. 없으면 배포 단계가 실패한다 — 2026-08-14 P0 블로커 회귀 가드.
    expect(pkg.repository?.url ?? "").toMatch(/github\.com\/SWJoong\/EASYREAD/);
    expect(pkg.bugs?.url ?? "").toMatch(/github\.com/);
    expect(pkg.homepage ?? "").toMatch(/github\.com/);
    expect((pkg.author ?? "").length).toBeGreaterThan(0);
  });
});
