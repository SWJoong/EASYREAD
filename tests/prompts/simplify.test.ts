import { connectClient } from "../tools/tool-harness.js";

/**
 * T-09 · simplify-text 프롬프트 계약 (FR-05·FR-06, 명세: 02 §3.2). [HANDOFF→U]
 * Instance-U가 src/prompts/simplify.ts(registerSimplifyPrompt)로 구현하고 server.ts에서 등록하면 green.
 *
 * FR-05 AC — 생성된 프롬프트 메시지에 다음 3요소가 포함되어야 한다(아래 문자열이 계약 마커):
 *   ① 변환 절차(guidelines §6 7단계·도구 호출 지시)  → "절차"
 *   ② 정확성 원칙(§7)                                → "정확성"
 *   ③ "당사자 감수 전 초안" 고지 지시(FR-06)          → "감수" + "초안"
 * 입력: text(필수), audience(선택, 기본 "발달장애인 등 낮은 문해력 독자"). 원문·audience는 메시지에 반영.
 */
type PromptMsg = { role: string; content?: { type?: string; text?: string } };
function promptText(res: unknown): string {
  const msgs = (res as { messages?: PromptMsg[] }).messages ?? [];
  return msgs.map((m) => (m.content?.type === "text" ? m.content.text ?? "" : "")).join("\n");
}

const opened: Array<() => Promise<void>> = [];
afterEach(async () => {
  for (const close of opened.splice(0)) await close();
});
async function client() {
  const c = await connectClient();
  opened.push(c.close);
  return c.client;
}

describe("simplify-text 프롬프트 (InMemory 계약)", () => {
  it("TC-PROMPT-SIMPLIFY-01: prompts/list에 simplify-text가 text·audience 인자와 함께 노출된다", async () => {
    const c = await client();
    const { prompts } = await c.listPrompts();
    const p = prompts.find((x) => x.name === "simplify-text");
    expect(p).toBeDefined();
    expect(p?.arguments?.some((a) => a.name === "text")).toBe(true);
    expect(p?.arguments?.some((a) => a.name === "audience")).toBe(true);
  });

  it("TC-PROMPT-SIMPLIFY-02: FR-05 3요소(변환 절차·정확성 원칙·감수 전 초안 고지)를 담는다", async () => {
    const c = await client();
    const res = await c.getPrompt({ name: "simplify-text", arguments: { text: "원문 예시입니다." } });
    const text = promptText(res);
    expect(text).toContain("절차"); // ① 변환 절차
    expect(text).toContain("정확성"); // ② 정확성 원칙(§7)
    expect(text).toContain("감수"); // ③ 감수 전 초안 고지(FR-06)
    expect(text).toContain("초안");
  });

  it("TC-PROMPT-SIMPLIFY-03: 원문(text)이 생성 메시지에 포함된다", async () => {
    const c = await client();
    const raw = "붙여넣은 공지문 원문 텍스트.";
    const res = await c.getPrompt({ name: "simplify-text", arguments: { text: raw } });
    expect(promptText(res)).toContain(raw);
  });

  it("TC-PROMPT-SIMPLIFY-04: audience 미지정 시 기본 대상(발달장애인)이 반영된다", async () => {
    const c = await client();
    const res = await c.getPrompt({ name: "simplify-text", arguments: { text: "원문." } });
    expect(promptText(res)).toContain("발달장애인");
  });

  it("TC-PROMPT-SIMPLIFY-05: audience 지정 시 그 대상이 반영된다", async () => {
    const c = await client();
    const res = await c.getPrompt({
      name: "simplify-text",
      arguments: { text: "원문.", audience: "노인 독자" },
    });
    expect(promptText(res)).toContain("노인 독자");
  });

  it("TC-PROMPT-SIMPLIFY-06: 필수 인자 text 누락 시 오류", async () => {
    const c = await client();
    await expect(c.getPrompt({ name: "simplify-text", arguments: {} })).rejects.toThrow();
  });
});
