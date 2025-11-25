import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingGuideModal from "./BrainwritingGuideModal";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("BrainwritingGuideModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("isOpen=trueの場合、モーダルが表示される", () => {
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("ブレインライティングの使い方")).toBeInTheDocument();
    });

    it("isOpen=falseの場合、モーダルが非表示", () => {
      render(<BrainwritingGuideModal isOpen={false} onClose={mockOnClose} />);

      expect(screen.queryByText("ブレインライティングの使い方")).not.toBeInTheDocument();
    });

    it("タブが表示される", () => {
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("X投稿版")).toBeInTheDocument();
      expect(screen.getByText("チーム利用版")).toBeInTheDocument();
    });
  });

  describe("タブ切り替え", () => {
    it("初期状態ではX投稿版の内容が表示される", () => {
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("X投稿版とは？")).toBeInTheDocument();
    });

    it("チーム利用版タブをクリックするとチーム利用版の内容が表示される", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText("チーム利用版"));

      expect(screen.getByText("チーム利用版とは？")).toBeInTheDocument();
    });

    it("X投稿版タブをクリックするとX投稿版の内容が表示される", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      // チーム利用版に切り替え
      await user.click(screen.getByText("チーム利用版"));
      expect(screen.getByText("チーム利用版とは？")).toBeInTheDocument();

      // X投稿版に戻す
      await user.click(screen.getByText("X投稿版"));
      expect(screen.getByText("X投稿版とは？")).toBeInTheDocument();
    });
  });

  describe("X投稿版コンテンツ", () => {
    it("基本的な流れが表示される", () => {
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("基本的な流れ")).toBeInTheDocument();
      expect(screen.getByText("テーマ設定")).toBeInTheDocument();
      expect(screen.getByText("1行目にアイデアを記載")).toBeInTheDocument();
      expect(screen.getByText("Xに共有")).toBeInTheDocument();
    });

    it("効果的な使い方のコツが表示される", () => {
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("効果的な使い方のコツ")).toBeInTheDocument();
    });

    it("よくある質問が表示される", () => {
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText("よくある質問")).toBeInTheDocument();
      expect(screen.getByText("Q. 誰でもアイデアを追加できますか？")).toBeInTheDocument();
    });
  });

  describe("チーム利用版コンテンツ", () => {
    it("基本的な流れが表示される", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText("チーム利用版"));

      expect(screen.getByText("参加者招待")).toBeInTheDocument();
      expect(screen.getByText(/第1ラウンド/)).toBeInTheDocument();
    });

    it("よくある質問が表示される", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      await user.click(screen.getByText("チーム利用版"));

      expect(screen.getByText("Q. 何人で実施するのが良いですか？")).toBeInTheDocument();
    });
  });

  describe("閉じる操作", () => {
    it("右上の閉じるボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      // 右上の閉じるボタン（aria-label）をクリック
      await user.click(closeButtons[0]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("下部の閉じるボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole("button", { name: "閉じる" });
      // 下部の閉じるボタンをクリック
      await user.click(closeButtons[1]);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("オーバーレイをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingGuideModal isOpen={true} onClose={mockOnClose} />);

      // オーバーレイ（背景）をクリック
      const overlay = document.querySelector(".bg-black\\/50");
      expect(overlay).toBeInTheDocument();
      await user.click(overlay!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
