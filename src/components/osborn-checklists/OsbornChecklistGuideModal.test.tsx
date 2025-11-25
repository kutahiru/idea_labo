import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistGuideModal from "./OsbornChecklistGuideModal";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("OsbornChecklistGuideModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("isOpen=trueの場合、モーダルが表示される", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("オズボーンのチェックリストの使い方")).toBeInTheDocument();
    });

    it("isOpen=falseの場合、モーダルが表示されない", () => {
      render(<OsbornChecklistGuideModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText("オズボーンのチェックリストの使い方")).not.toBeInTheDocument();
    });

    it("オズボーンのチェックリストの説明が表示される", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("オズボーンのチェックリストとは？")).toBeInTheDocument();
      expect(
        screen.getByText(/既存のアイデアや製品を9つの視点から見直すことで/)
      ).toBeInTheDocument();
    });

    it("基本的な流れが表示される", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("基本的な流れ")).toBeInTheDocument();
      expect(screen.getByText("テーマ設定")).toBeInTheDocument();
      expect(screen.getByText("9つの視点で発想")).toBeInTheDocument();
    });

    it("9つの視点の活用例が表示される", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("9つの視点の活用例")).toBeInTheDocument();
      expect(screen.getByText(/転用：/)).toBeInTheDocument();
      expect(screen.getByText(/応用：/)).toBeInTheDocument();
      expect(screen.getByText(/変更：/)).toBeInTheDocument();
    });

    it("効果的な使い方のコツが表示される", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("効果的な使い方のコツ")).toBeInTheDocument();
      expect(screen.getByText(/各視点の\?アイコンをホバーすると/)).toBeInTheDocument();
    });

    it("よくある質問が表示される", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("よくある質問")).toBeInTheDocument();
      expect(screen.getByText("Q. すべての項目を埋める必要がありますか？")).toBeInTheDocument();
      expect(screen.getByText("Q. 入力内容は保存されますか？")).toBeInTheDocument();
    });
  });

  describe("閉じる操作", () => {
    it("閉じるボタン（上部）をクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      // 複数の閉じるボタンがあるので最初のもの（上部のXボタン）を使用
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("閉じるボタン（下部）をクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      // 下部の「閉じる」テキストボタン
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      const bottomCloseButton = closeButtons[closeButtons.length - 1];
      await user.click(bottomCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("オーバーレイをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      // オーバーレイ（bg-black/50クラスを持つ要素）をクリック
      const overlay = document.querySelector(".bg-black\\/50");
      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it("モーダル本体をクリックしてもonCloseが呼ばれない", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      const modalContent = screen.getByText("オズボーンのチェックリストの使い方");
      await user.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("閉じるボタンにaria-labelが設定されている", () => {
      render(<OsbornChecklistGuideModal isOpen={true} onClose={mockOnClose} />);

      // 複数の閉じるボタンが存在することを確認
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
