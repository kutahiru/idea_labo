import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingModal from "./BrainwritingModal";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("BrainwritingModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("新規作成モード", () => {
    it("タイトル入力欄が表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();
    });

    it("テーマ入力欄が表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByLabelText("テーマ *")).toBeInTheDocument();
    });

    it("説明入力欄が表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByLabelText("説明")).toBeInTheDocument();
    });

    it("利用方法セレクターが表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByText("利用方法")).toBeInTheDocument();
      expect(screen.getByText("X投稿")).toBeInTheDocument();
      expect(screen.getByText("チーム利用")).toBeInTheDocument();
    });

    it("確定ボタンが表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      expect(screen.getByRole("button", { name: "確定" })).toBeInTheDocument();
    });

    it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      await user.click(screen.getByRole("button", { name: "キャンセル" }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("フォームを入力して確定するとonSubmitが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      await user.type(screen.getByLabelText("タイトル *"), "テストタイトル");
      await user.type(screen.getByLabelText("テーマ *"), "テストテーマ");
      await user.click(screen.getByRole("button", { name: "確定" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "テストタイトル",
            themeName: "テストテーマ",
            usageScope: USAGE_SCOPE.XPOST, // デフォルト値
          })
        );
      });
    });

    it("利用方法を変更できる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      // チーム利用を選択
      const teamLabel = screen.getByText("チーム利用").closest("label");
      expect(teamLabel).toBeInTheDocument();
      await user.click(teamLabel!);

      await user.type(screen.getByLabelText("タイトル *"), "テストタイトル");
      await user.type(screen.getByLabelText("テーマ *"), "テストテーマ");
      await user.click(screen.getByRole("button", { name: "確定" }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            usageScope: USAGE_SCOPE.TEAM,
          })
        );
      });
    });
  });

  describe("編集モード", () => {
    const initialData = {
      title: "既存タイトル",
      themeName: "既存テーマ",
      description: "既存説明",
      usageScope: USAGE_SCOPE.XPOST as const,
    };

    it("初期値が表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      expect(screen.getByDisplayValue("既存タイトル")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存テーマ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存説明")).toBeInTheDocument();
    });

    it("更新ボタンが表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });

    it("編集モードでは利用方法変更不可のメッセージが表示される", () => {
      render(
        <BrainwritingModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      expect(screen.getByText("（編集時は変更できません）")).toBeInTheDocument();
    });
  });
});
