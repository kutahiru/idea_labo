import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaModal from "./IdeaModal";

// framer-motionをモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("IdeaModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockCategories = [
    { id: 1, name: "カテゴリ1", description: null, created_at: new Date() },
    { id: 2, name: "カテゴリ2", description: "説明", created_at: new Date() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe("作成モード", () => {
    it("モーダルのタイトルが「アイデアを登録」になる", () => {
      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          mode="create"
          showCategoryField={true}
        />
      );

      expect(screen.getByText("アイデアを登録")).toBeInTheDocument();
    });

    it("カテゴリフィールドが表示される（showCategoryField=true）", () => {
      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          mode="create"
          showCategoryField={true}
        />
      );

      expect(screen.getByText("カテゴリ *")).toBeInTheDocument();
    });

    it("カテゴリフィールドが表示されない（showCategoryField=false）", () => {
      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      expect(screen.queryByText("カテゴリ *")).not.toBeInTheDocument();
    });

    it("フォームに入力してsubmitできる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      // アイデア名を入力
      const nameInput = screen.getByPlaceholderText("アイデア名を入力");
      await user.type(nameInput, "テストアイデア");

      // 重要度を選択
      const prioritySelect = screen.getByLabelText("重要度 *");
      await user.selectOptions(prioritySelect, "high");

      // 説明を入力
      const descriptionTextarea = screen.getByPlaceholderText("説明（任意）");
      await user.type(descriptionTextarea, "テスト説明");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "テストアイデア",
          description: "テスト説明",
          priority: "high",
          categoryId: 1,
        });
      });
    });

    it("カテゴリ未選択の場合、エラーが表示される", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          mode="create"
          showCategoryField={true}
        />
      );

      // アイデア名だけ入力
      const nameInput = screen.getByPlaceholderText("アイデア名を入力");
      await user.type(nameInput, "テストアイデア");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText("カテゴリを選択してください")).toBeInTheDocument();
      });

      // onSubmitは呼ばれない
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("アイデア名が空の場合、エラーが表示される", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      // 確定ボタンをクリック（何も入力しない）
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText("アイデア名は必須です")).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("編集モード", () => {
    it("モーダルのタイトルが「アイデアを編集」になる", () => {
      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="edit"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      expect(screen.getByText("アイデアを編集")).toBeInTheDocument();
    });

    it("初期データが表示される", () => {
      const initialData = {
        name: "既存アイデア",
        description: "既存の説明",
        priority: "high" as const,
      };

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      expect(screen.getByDisplayValue("既存アイデア")).toBeInTheDocument();
      expect(screen.getByDisplayValue("既存の説明")).toBeInTheDocument();

      // 重要度selectの値を確認
      const prioritySelect = screen.getByLabelText("重要度 *") as HTMLSelectElement;
      expect(prioritySelect.value).toBe("high");
    });

    it("データを編集してsubmitできる", async () => {
      const user = userEvent.setup();
      const initialData = {
        name: "既存アイデア",
        description: "既存の説明",
        priority: "medium" as const,
      };

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialData={initialData}
          mode="edit"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      // アイデア名を変更
      const nameInput = screen.getByDisplayValue("既存アイデア");
      await user.clear(nameInput);
      await user.type(nameInput, "更新されたアイデア");

      // 登録ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /更新/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "更新されたアイデア",
          description: "既存の説明",
          priority: "medium",
          categoryId: 1,
        });
      });
    });
  });

  describe("カテゴリ選択", () => {
    it("カテゴリフィールドにカテゴリ選択用の入力欄が表示される", async () => {
      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          categories={mockCategories}
          mode="create"
          showCategoryField={true}
        />
      );

      // カテゴリ入力欄が表示される
      const comboboxInput = screen.getByPlaceholderText("カテゴリを検索または選択してください");
      expect(comboboxInput).toBeInTheDocument();
    });
  });

  describe("閉じる動作", () => {
    it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("送信成功時にonCloseが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      // アイデア名を入力
      const nameInput = screen.getByPlaceholderText("アイデア名を入力");
      await user.type(nameInput, "テストアイデア");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("バリデーション", () => {
    it("アイデア名が101文字以上の場合、100文字で切り捨てられる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      const nameInput = screen.getByPlaceholderText("アイデア名を入力") as HTMLInputElement;
      const longName = "あ".repeat(101);
      await user.type(nameInput, longName);

      // maxLength=100により100文字で切り捨てられる
      expect(nameInput.value).toHaveLength(100);
    });

    it("説明が501文字以上の場合、500文字で切り捨てられる", async () => {
      const user = userEvent.setup();

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
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
      mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      render(
        <IdeaModal
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          mode="create"
          showCategoryField={false}
          fixedCategoryId={1}
        />
      );

      // アイデア名を入力
      const nameInput = screen.getByPlaceholderText("アイデア名を入力");
      await user.type(nameInput, "テストアイデア");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // 送信中はボタンが無効化される
      expect(submitButton).toBeDisabled();
    });
  });
});
