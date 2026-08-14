import { connectClient, makeTestDictionary } from "../tools/tool-harness.js";
import { loadResources } from "../../src/data/resources.js";

/**
 * T-09 · easyread:// 리소스 계약 (FR-09, 명세: 02 §3.3). [HANDOFF→U]
 * Instance-U가 server.ts에 아래 3종을 등록하면 green (easyread://resources는 T-14로 이미 등록됨).
 *   easyread://guidelines            text/markdown     작성 지침 전문
 *   easyread://guidelines/checklist  text/markdown     검증 규칙 체크리스트(규칙 ID 표)
 *   easyread://dictionary            application/json   단어 사전 전체(createServer 주입 dictionary 직렬화)
 * guidelines·checklist는 정적 콘텐츠(assets 로드 또는 인라인), dictionary는 주입 사전이 있을 때 등록.
 */
type Contents = { uri?: string; mimeType?: string; text?: string };
function firstContent(res: unknown): Contents {
  const arr = (res as { contents?: Contents[] }).contents ?? [];
  return arr[0] ?? {};
}

const opened: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of opened.splice(0)) await close();
});
async function client(withDict = false) {
  const c = await connectClient(withDict ? makeTestDictionary() : undefined);
  opened.push(c.close);
  return c.client;
}

describe("easyread:// 리소스 (InMemory 계약, FR-09)", () => {
  it("TC-RES-01: resources/list에 지침·체크리스트·사전이 올바른 MIME으로 노출된다", async () => {
    const c = await client(true);
    const { resources } = await c.listResources();
    const byUri = new Map(resources.map((r) => [r.uri, r]));
    expect(byUri.get("easyread://guidelines")?.mimeType).toBe("text/markdown");
    expect(byUri.get("easyread://guidelines/checklist")?.mimeType).toBe("text/markdown");
    expect(byUri.get("easyread://dictionary")?.mimeType).toBe("application/json");
  });

  it("TC-RES-02: easyread://guidelines는 비어 있지 않은 Markdown을 돌려준다", async () => {
    const c = await client();
    const res = await c.readResource({ uri: "easyread://guidelines" });
    const c0 = firstContent(res);
    expect(c0.mimeType).toBe("text/markdown");
    expect((c0.text ?? "").length).toBeGreaterThan(0);
  });

  it("TC-RES-03: easyread://guidelines/checklist는 규칙 ID(SEN-01)를 포함한다", async () => {
    const c = await client();
    const res = await c.readResource({ uri: "easyread://guidelines/checklist" });
    const c0 = firstContent(res);
    expect(c0.mimeType).toBe("text/markdown");
    expect(c0.text ?? "").toContain("SEN-01");
  });

  it("TC-RES-04: easyread://dictionary는 사전 전체를 유효한 JSON으로 돌려준다", async () => {
    const c = await client(true);
    const res = await c.readResource({ uri: "easyread://dictionary" });
    const c0 = firstContent(res);
    expect(c0.mimeType).toBe("application/json");
    expect(() => JSON.parse(c0.text ?? "")).not.toThrow();
    expect(c0.text ?? "").toContain("구비서류"); // makeTestDictionary의 등재어
  });

  /**
   * TC-RES-05 [HANDOFF→U]: 기존 easyread://resources(T-14) read 응답 contents에 mimeType 누락.
   * list 메타(registerResource 3번째 인자)에는 mimeType이 있으나 read 응답 contents엔 없어,
   * 신규 3종(guidelines·checklist·dictionary)과 불일치. U가 server.ts의 easyread://resources
   * contents에 mimeType:"application/json"을 추가하면 green(신규 3종과 동일 패턴).
   */
  it("TC-RES-05: easyread://resources read 응답 contents에 mimeType이 명시된다", async () => {
    const conn = await connectClient(undefined, loadResources());
    opened.push(conn.close);
    const res = await conn.client.readResource({ uri: "easyread://resources" });
    const c0 = firstContent(res);
    expect(c0.mimeType).toBe("application/json");
  });
});
