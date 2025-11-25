# テストガイド

## テスト実行

```bash
# 全テスト実行
npm test

# 特定ファイル実行
npm test -- src/lib/idea.test.ts

# 特定ディレクトリ実行
npm test -- src/components/ideas/

# カバレッジレポート
npm run test:coverage
```

## 技術スタック

- Vitest 3.2.4
- @testing-library/react 16.x
- happy-dom 15.x

## テストの書き方

### 基本構造

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("コンポーネント名", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("テストケースの説明", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole("button", { name: "送信" }));

    expect(screen.getByText("完了")).toBeInTheDocument();
  });
});
```

### よく使うモック

```typescript
// framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

// IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof IntersectionObserver;
```

## 参考リンク

- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
