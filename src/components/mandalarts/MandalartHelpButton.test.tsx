import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartHelpButton from "./MandalartHelpButton";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("MandalartHelpButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("ヘルプボタンが表示される", () => {
      render(<MandalartHelpButton />);

      expect(screen.getByRole("button", { name: "使い方を見る" })).toBeInTheDocument();
    });

    it("初期状態ではモーダルが表示されない", () => {
      render(<MandalartHelpButton />);

      expect(screen.queryByText("マンダラートの使い方")).not.toBeInTheDocument();
    });
  });

  describe("ヘルプボタンクリック", () => {
    it("ヘルプボタンをクリックするとガイドモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<MandalartHelpButton />);

      const helpButton = screen.getByRole("button", { name: "使い方を見る" });
      await user.click(helpButton);

      expect(screen.getByText("マンダラートの使い方")).toBeInTheDocument();
    });

    it("モーダルの閉じるボタンをクリックするとモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<MandalartHelpButton />);

      // モーダルを開く
      const helpButton = screen.getByRole("button", { name: "使い方を見る" });
      await user.click(helpButton);

      expect(screen.getByText("マンダラートの使い方")).toBeInTheDocument();

      // モーダルを閉じる（複数の閉じるボタンがあるので最初のものを使用）
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText("マンダラートの使い方")).not.toBeInTheDocument();
      });
    });

    it("モーダルを閉じた後、再度開くことができる", async () => {
      const user = userEvent.setup();
      render(<MandalartHelpButton />);

      const helpButton = screen.getByRole("button", { name: "使い方を見る" });

      // 1回目：モーダルを開く
      await user.click(helpButton);
      expect(screen.getByText("マンダラートの使い方")).toBeInTheDocument();

      // モーダルを閉じる（複数の閉じるボタンがあるので最初のものを使用）
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText("マンダラートの使い方")).not.toBeInTheDocument();
      });

      // 2回目：モーダルを再度開く
      await user.click(helpButton);
      expect(screen.getByText("マンダラートの使い方")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("ヘルプボタンにaria-labelが設定されている", () => {
      render(<MandalartHelpButton />);

      const helpButton = screen.getByRole("button", { name: "使い方を見る" });
      expect(helpButton).toHaveAttribute("aria-label", "使い方を見る");
    });
  });
});
