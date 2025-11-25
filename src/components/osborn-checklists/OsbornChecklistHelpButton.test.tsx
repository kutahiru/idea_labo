import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistHelpButton from "./OsbornChecklistHelpButton";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("OsbornChecklistHelpButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("ヘルプボタンが表示される", () => {
      render(<OsbornChecklistHelpButton />);

      expect(screen.getByRole("button", { name: "使い方を見る" })).toBeInTheDocument();
    });

    it("初期状態ではモーダルが表示されない", () => {
      render(<OsbornChecklistHelpButton />);

      expect(screen.queryByText("オズボーンのチェックリストの使い方")).not.toBeInTheDocument();
    });
  });

  describe("ヘルプボタンクリック", () => {
    it("ヘルプボタンをクリックするとガイドモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistHelpButton />);

      const helpButton = screen.getByRole("button", { name: "使い方を見る" });
      await user.click(helpButton);

      expect(screen.getByText("オズボーンのチェックリストの使い方")).toBeInTheDocument();
    });

    it("モーダルの閉じるボタンをクリックするとモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistHelpButton />);

      // モーダルを開く
      const helpButton = screen.getByRole("button", { name: "使い方を見る" });
      await user.click(helpButton);

      expect(screen.getByText("オズボーンのチェックリストの使い方")).toBeInTheDocument();

      // モーダルを閉じる（複数の閉じるボタンがあるので最初のものを使用）
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText("オズボーンのチェックリストの使い方")).not.toBeInTheDocument();
      });
    });

    it("モーダルを閉じた後、再度開くことができる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistHelpButton />);

      const helpButton = screen.getByRole("button", { name: "使い方を見る" });

      // 1回目：モーダルを開く
      await user.click(helpButton);
      expect(screen.getByText("オズボーンのチェックリストの使い方")).toBeInTheDocument();

      // モーダルを閉じる（複数の閉じるボタンがあるので最初のものを使用）
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText("オズボーンのチェックリストの使い方")).not.toBeInTheDocument();
      });

      // 2回目：モーダルを再度開く
      await user.click(helpButton);
      expect(screen.getByText("オズボーンのチェックリストの使い方")).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("ヘルプボタンにaria-labelが設定されている", () => {
      render(<OsbornChecklistHelpButton />);

      const helpButton = screen.getByRole("button", { name: "使い方を見る" });
      expect(helpButton).toHaveAttribute("aria-label", "使い方を見る");
    });
  });
});
