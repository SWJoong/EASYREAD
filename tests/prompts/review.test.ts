import { connectClient } from "../tools/tool-harness.js";

/**
 * T-09 · easy-read-review 프롬프트 계약 (FR-08, 명세: 02 §3.2). [HANDOFF→U]
 * Instance-U가 src/prompts/review.ts(registerReviewPrompt)로 구현하고 server.ts에서 등록하면 green.
 *
 * 뼈대: ① 검토자 역할 ② validate_easy_read 호출 후 위반을 **규칙 ID로 인용**하며 수정안 제시
 *       ③ 사실 대조 지시(original 제공 시). 입력: text(필수), original(선택).
 * FR-08 AC — 프롬프트에 규칙 ID 인용 지시가 포함된다("규칙 ID" + "validate_easy_read"가 계약 마커).
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

describe("easy-read-review 프롬프트 (InMemory 계약)", () => {
  it("TC-PROMPT-REVIEW-01: prompts/list에 easy-read-review가 text·original 인자와 함께 노출된다", async () => {
    const c = await client();
    const { prompts } = await c.listPrompts();
    const p = prompts.find((x) => x.name === "easy-read-review");
    expect(p).toBeDefined();
    expect(p?.arguments?.some((a) => a.name === "text")).toBe(true);
    expect(p?.arguments?.some((a) => a.name === "original")).toBe(true);
  });

  it("TC-PROMPT-REVIEW-02: 규칙 ID 인용 지시와 validate_easy_read 호출 지시를 담는다(FR-08 AC)", async () => {
    const c = await client();
    const res = await c.getPrompt({ name: "easy-read-review", arguments: { text: "검토할 초안입니다." } });
    const text = promptText(res);
    expect(text).toContain("규칙 ID");
    expect(text).toContain("validate_easy_read");
  });

  it("TC-PROMPT-REVIEW-03: 검토 대상 text가 생성 메시지에 포함된다", async () => {
    const c = await client();
    const raw = "검토가 필요한 변환 초안 문장.";
    const res = await c.getPrompt({ name: "easy-read-review", arguments: { text: raw } });
    expect(promptText(res)).toContain(raw);
  });

  it("TC-PROMPT-REVIEW-04: original 제공 시 사실 대조 지시와 원문이 포함된다", async () => {
    const c = await client();
    const original = "원문: 신청 기간은 3월 2일까지입니다.";
    const res = await c.getPrompt({
      name: "easy-read-review",
      arguments: { text: "쉽게 바꾼 문장.", original },
    });
    const text = promptText(res);
    expect(text).toContain("사실"); // 사실 대조 지시
    expect(text).toContain(original);
  });

  it("TC-PROMPT-REVIEW-05: 필수 인자 text 누락 시 오류", async () => {
    const c = await client();
    await expect(c.getPrompt({ name: "easy-read-review", arguments: {} })).rejects.toThrow();
  });
});
