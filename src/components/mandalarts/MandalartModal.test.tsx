import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartModal from "./MandalartModal";
import { MandalartFormData } from "@/schemas/mandalart";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("MandalartModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

  const initialData: MandalartFormData = {
    title: "初期タイトル",
    themeName: "初期テーマ",
    description: "初期説明",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("作成モードで「新規作成」が表示される", () => {
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="create"
        />
      );

      expect(screen.getByText("新規作成")).toBeInTheDocument();
    });

    it("編集モードで「編集」が表示される", () => {
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("初期データが表示される", () => {
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="create"
        />
      );

      expect(screen.getByDisplayValue("初期タイトル")).toBeInTheDocument();
      expect(screen.getByDisplayValue("初期テーマ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("初期説明")).toBeInTheDocument();
    });

    it("initialDataがundefinedの場合、空のフォームが表示される", () => {
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
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
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const titleInput = screen.getByLabelText("タイトル *");
      await user.type(titleInput, "新しいタイトル");

      expect(screen.getByDisplayValue("新しいタイトル")).toBeInTheDocument();
    });

    it("テーマを入力できる", async () => {
      const user = userEvent.setup();
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const themeInput = screen.getByLabelText("テーマ *");
      await user.type(themeInput, "新しいテーマ");

      expect(screen.getByDisplayValue("新しいテーマ")).toBeInTheDocument();
    });

    it("説明を入力できる", async () => {
      const user = userEvent.setup();
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
        />
      );

      const descriptionInput = screen.getByLabelText("説明");
      await user.type(descriptionInput, "新しい説明");

      expect(screen.getByDisplayValue("新しい説明")).toBeInTheDocument();
    });
  });

  describe("バリデーション", () => {
    it("タイトルが空の場合、エラーが表示される", async () => {
      const user = userEvent.setup();
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={{ title: "", themeName: "テーマ", description: null }}
          mode="create"
        />
      );

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
      });
    });

    it("テーマが空の場合、エラーが表示される", async () => {
      const user = userEvent.setup();
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={{ title: "タイトル", themeName: "", description: null }}
          mode="create"
        />
      );

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
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="create"
        />
      );

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(initialData);
      });
    });

    it("送信成功後にonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="create"
        />
      );

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("編集モードでは「更新」ボタンが表示される", () => {
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
    });
  });

  describe("キャンセル", () => {
    it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <MandalartModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="create"
        />
      );

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
