import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test-setup.ts"],
    testTimeout: 60000, // OpenAI API呼び出しがあるため60秒に設定
  },
});
