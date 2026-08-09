import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 규칙 골든 테스트는 bare describe/it/expect 사용 (03 §7 컨벤션).
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
