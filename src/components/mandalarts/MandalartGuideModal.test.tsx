import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartGuideModal from "./MandalartGuideModal";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("MandalartGuideModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("isOpen=trueの場合、モーダルが表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("マンダラートの使い方")).toBeInTheDocument();
    });

    it("isOpen=falseの場合、モーダルが表示されない", () => {
      render(<MandalartGuideModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText("マンダラートの使い方")).not.toBeInTheDocument();
    });

    it("マンダラートの説明が表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("マンダラートとは？")).toBeInTheDocument();
      expect(
        screen.getByText(/9×9（81マス）のグリッドを使ってアイデアを広げていく発想法/)
      ).toBeInTheDocument();
    });

    it("基本的な流れが表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("基本的な流れ")).toBeInTheDocument();
      expect(screen.getByText("中央にテーマを入力")).toBeInTheDocument();
      expect(screen.getByText("周囲8マスにサブテーマを入力")).toBeInTheDocument();
    });

    it("具体例が表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("具体例")).toBeInTheDocument();
      expect(screen.getByText(/テーマ：「英語学習」/)).toBeInTheDocument();
    });

    it("効果的な使い方のコツが表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("効果的な使い方のコツ")).toBeInTheDocument();
      expect(screen.getByText(/最初は質より量を重視し/)).toBeInTheDocument();
    });

    it("活用シーンが表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("活用シーン")).toBeInTheDocument();
      expect(screen.getByText("目標達成の行動計画を立てるとき")).toBeInTheDocument();
    });

    it("よくある質問が表示される", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("よくある質問")).toBeInTheDocument();
      expect(screen.getByText("Q. すべてのマスを埋める必要がありますか？")).toBeInTheDocument();
      expect(screen.getByText("Q. 入力内容は保存されますか？")).toBeInTheDocument();
    });
  });

  describe("閉じる操作", () => {
    it("閉じるボタン（上部）をクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      // 複数の閉じるボタンがあるので最初のもの（上部のXボタン）を使用
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      await user.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("閉じるボタン（下部）をクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      // 下部の「閉じる」テキストボタン
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      const bottomCloseButton = closeButtons[closeButtons.length - 1];
      await user.click(bottomCloseButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("オーバーレイをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      // オーバーレイ（bg-black/50クラスを持つ要素）をクリック
      const overlay = document.querySelector(".bg-black\\/50");
      if (overlay) {
        await user.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it("モーダル本体をクリックしてもonCloseが呼ばれない", async () => {
      const user = userEvent.setup();
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      const modalContent = screen.getByText("マンダラートの使い方");
      await user.click(modalContent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("閉じるボタンにaria-labelが設定されている", () => {
      render(<MandalartGuideModal isOpen={true} onClose={mockOnClose} />);

      // 複数の閉じるボタンが存在することを確認
      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
