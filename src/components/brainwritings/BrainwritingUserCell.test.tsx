import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import BrainwritingUserCell from "./BrainwritingUserCell";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BrainwritingUserCell", () => {
  describe("表示", () => {
    it("ユーザー名が表示される", () => {
      render(<BrainwritingUserCell userName="テストユーザー" />);

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    });

    it("rowIndexを指定できる", () => {
      render(<BrainwritingUserCell userName="ユーザー" rowIndex={2} />);

      expect(screen.getByText("ユーザー")).toBeInTheDocument();
    });

    it("空のユーザー名も表示できる", () => {
      render(<BrainwritingUserCell userName="" />);

      // 空のspan要素が存在
      const span = document.querySelector("span.text-primary");
      expect(span).toBeInTheDocument();
      expect(span?.textContent).toBe("");
    });
  });
});
