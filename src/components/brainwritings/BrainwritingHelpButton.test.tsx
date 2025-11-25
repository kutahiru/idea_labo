import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingHelpButton from "./BrainwritingHelpButton";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("BrainwritingHelpButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("ヘルプボタンが表示される", () => {
      render(<BrainwritingHelpButton />);

      expect(screen.getByRole("button", { name: "使い方を見る" })).toBeInTheDocument();
    });

    it("HelpCircleアイコンが表示される", () => {
      render(<BrainwritingHelpButton />);

      const button = screen.getByRole("button", { name: "使い方を見る" });
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("初期状態ではガイドモーダルは非表示", () => {
      render(<BrainwritingHelpButton />);

      expect(screen.queryByText("ブレインライティングの使い方")).not.toBeInTheDocument();
    });
  });

  describe("モーダル操作", () => {
    it("ヘルプボタンをクリックするとガイドモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<BrainwritingHelpButton />);

      await user.click(screen.getByRole("button", { name: "使い方を見る" }));

      expect(screen.getByText("ブレインライティングの使い方")).toBeInTheDocument();
    });

    it("モーダルを閉じるとガイドモーダルが非表示になる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingHelpButton />);

      // モーダルを開く
      await user.click(screen.getByRole("button", { name: "使い方を見る" }));
      expect(screen.getByText("ブレインライティングの使い方")).toBeInTheDocument();

      // モーダルを閉じる
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText("ブレインライティングの使い方")).not.toBeInTheDocument();
      });
    });

    it("モーダル内でタブ切り替えができる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingHelpButton />);

      // モーダルを開く
      await user.click(screen.getByRole("button", { name: "使い方を見る" }));

      // 初期状態はX投稿版
      expect(screen.getByText("X投稿版とは？")).toBeInTheDocument();

      // チーム利用版に切り替え
      await user.click(screen.getByText("チーム利用版"));
      expect(screen.getByText("チーム利用版とは？")).toBeInTheDocument();
    });
  });
});
