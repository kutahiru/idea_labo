import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistModal from "./OsbornChecklistModal";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("OsbornChecklistModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("表示", () => {
    it("作成モードで「新規作成」が表示される", () => {
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(screen.getByText("新規作成")).toBeInTheDocument();
    });

    it("編集モードで「編集」が表示される", () => {
      render(
        <OsbornChecklistModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={{ title: "テスト", themeName: "テーマ", description: null }}
        />
      );

      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("初期データが表示される", () => {
      render(
        <OsbornChecklistModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={{ title: "テストタイトル", themeName: "テストテーマ", description: "テスト説明" }}
        />
      );

      expect(screen.getByDisplayValue("テストタイトル")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テストテーマ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("テスト説明")).toBeInTheDocument();
    });

    it("initialDataがundefinedの場合、空のフォームが表示される", () => {
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const titleInput = screen.getByLabelText("タイトル *");
      const themeInput = screen.getByLabelText("テーマ *");
      expect(titleInput).toHaveValue("");
      expect(themeInput).toHaveValue("");
    });
  });

  describe("入力", () => {
    it("タイトルを入力できる", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const titleInput = screen.getByLabelText("タイトル *");
      await user.type(titleInput, "新しいタイトル");

      expect(titleInput).toHaveValue("新しいタイトル");
    });

    it("テーマを入力できる", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const themeInput = screen.getByLabelText("テーマ *");
      await user.type(themeInput, "新しいテーマ");

      expect(themeInput).toHaveValue("新しいテーマ");
    });

    it("説明を入力できる", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const descInput = screen.getByLabelText("説明");
      await user.type(descInput, "新しい説明");

      expect(descInput).toHaveValue("新しい説明");
    });
  });

  describe("バリデーション", () => {
    it("タイトルが空の場合、エラーが表示される", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const themeInput = screen.getByLabelText("テーマ *");
      await user.type(themeInput, "テーマ");

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
      });
    });

    it("テーマが空の場合、エラーが表示される", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const titleInput = screen.getByLabelText("タイトル *");
      await user.type(titleInput, "タイトル");

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("テーマは必須です")).toBeInTheDocument();
      });
    });
  });

  describe("送信", () => {
    it("バリデーション成功時にonSubmitが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const titleInput = screen.getByLabelText("タイトル *");
      const themeInput = screen.getByLabelText("テーマ *");

      await user.type(titleInput, "テストタイトル");
      await user.type(themeInput, "テストテーマ");

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "テストタイトル",
            themeName: "テストテーマ",
          })
        );
      });
    });

    it("送信成功後にonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const titleInput = screen.getByLabelText("タイトル *");
      const themeInput = screen.getByLabelText("テーマ *");

      await user.type(titleInput, "テストタイトル");
      await user.type(themeInput, "テストテーマ");

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("編集モードでは「更新」ボタンが表示される", () => {
      render(
        <OsbornChecklistModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          initialData={{ title: "テスト", themeName: "テーマ", description: null }}
        />
      );

      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <OsbornChecklistModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
