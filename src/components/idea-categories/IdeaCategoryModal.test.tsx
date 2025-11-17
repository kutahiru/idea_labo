import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaCategoryModal from "./IdeaCategoryModal";

// framer-motionをモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("IdeaCategoryModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("作成モード", () => {
    it("モーダルのタイトルが「新規作成」になる", () => {
      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      expect(screen.getByText("新規作成")).toBeInTheDocument();
    });

    it("フォームに入力してsubmitできる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      // カテゴリ名を入力
      const nameInput = screen.getByPlaceholderText("カテゴリ名を入力");
      await user.type(nameInput, "テストカテゴリ");

      // 説明を入力
      const descriptionTextarea = screen.getByPlaceholderText("説明（任意）");
      await user.type(descriptionTextarea, "テスト説明");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "テストカテゴリ",
          description: "テスト説明",
        });
      });
    });

    it("カテゴリ名が空の場合、エラーが表示される", async () => {
      const user = userEvent.setup();

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      // 確定ボタンをクリック（何も入力しない）
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText("カテゴリ名は必須です")).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("編集モード", () => {
    it("モーダルのタイトルが「編集」になる", () => {
      render(<IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="edit" />);

      expect(screen.getByText("編集")).toBeInTheDocument();
    });

    it("初期データが表示される", () => {
      const initialData = {
        name: "既存カテゴリ",
        description: "既存の説明",
      };

      render(
        <IdeaCategoryModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      expect(screen.getByDisplayValue("既存カテゴリ")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();
    });

    it("データを編集してsubmitできる", async () => {
      const user = userEvent.setup();
      const initialData = {
        name: "既存カテゴリ",
        description: "既存の説明",
      };

      render(
        <IdeaCategoryModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
        />
      );

      // カテゴリ名を変更
      const nameInput = screen.getByDisplayValue("既存カテゴリ");
      await user.clear(nameInput);
      await user.type(nameInput, "更新されたカテゴリ");

      // 更新ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /更新/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "更新されたカテゴリ",
          description: "既存の説明",
        });
      });
    });
  });

  describe("閉じる動作", () => {
    it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("送信成功時にonCloseが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      // カテゴリ名を入力
      const nameInput = screen.getByPlaceholderText("カテゴリ名を入力");
      await user.type(nameInput, "テストカテゴリ");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("バリデーション", () => {
    it("カテゴリ名が101文字以上の場合、100文字で切り捨てられる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const nameInput = screen.getByPlaceholderText("カテゴリ名を入力") as HTMLInputElement;
      const longName = "あ".repeat(101);
      await user.type(nameInput, longName);

      // maxLength=100により100文字で切り捨てられる
      expect(nameInput.value).toHaveLength(100);
    });

    it("説明が501文字以上の場合、500文字で切り捨てられる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      const descriptionTextarea = screen.getByPlaceholderText(
        "説明（任意）"
      ) as HTMLTextAreaElement;
      const longDescription = "あ".repeat(501);
      await user.type(descriptionTextarea, longDescription);

      // maxLength=500により500文字で切り捨てられる
      expect(descriptionTextarea.value).toHaveLength(500);
    });
  });

  describe("送信中の状態", () => {
    it("送信中はボタンが無効化される", async () => {
      const user = userEvent.setup();
      // 送信処理を遅延させる
      mockOnSubmit.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <IdeaCategoryModal onClose={mockOnClose} onSubmit={mockOnSubmit} mode="create" />
      );

      // カテゴリ名を入力
      const nameInput = screen.getByPlaceholderText("カテゴリ名を入力");
      await user.type(nameInput, "テストカテゴリ");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // 送信中はボタンが無効化される
      expect(submitButton).toBeDisabled();
    });
  });
});
