import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaCategoryPageClient from "./IdeaCategoryPageClient";
import { IdeaCategoryListItem } from "@/types/idea-category";

// モック設定
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

const mockSubmit = vi.fn();
const mockDelete = vi.fn();

vi.mock("@/hooks/useResourceSubmit", () => ({
  useResourceSubmit: (options: { onSuccess?: () => void }) => {
    return async (data: unknown) => {
      await mockSubmit(data);
      if (options.onSuccess) {
        options.onSuccess();
      }
    };
  },
  useResourceDelete: () => mockDelete,
}));

// IntersectionObserverのモック
class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

describe("IdeaCategoryPageClient", () => {
  const mockCategories: IdeaCategoryListItem[] = [
    { id: 1, name: "カテゴリ1", description: "説明1", created_at: new Date() },
    { id: 2, name: "カテゴリ2", description: "説明2", created_at: new Date() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
  });

  describe("表示", () => {
    it("新規作成ボタンが表示される", () => {
      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      expect(screen.getByRole("button", { name: /新規作成/i })).toBeInTheDocument();
    });

    it("カテゴリ一覧が表示される", () => {
      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      expect(screen.getByText("カテゴリ1")).toBeInTheDocument();
      expect(screen.getByText("カテゴリ2")).toBeInTheDocument();
    });
  });

  describe("新規作成", () => {
    it("新規作成ボタンをクリックするとモーダルが開く", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // モーダルが開く（カテゴリ名入力フィールドで確認）
      expect(screen.getByPlaceholderText("カテゴリ名を入力")).toBeInTheDocument();
    });

    it("新規作成でカテゴリを登録できる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // カテゴリ名を入力
      const nameInput = screen.getByPlaceholderText("カテゴリ名を入力");
      await user.type(nameInput, "新しいカテゴリ");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // submitとrefreshが呼ばれる
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("登録成功後、モーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // カテゴリ名を入力
      const nameInput = screen.getByPlaceholderText("カテゴリ名を入力");
      await user.type(nameInput, "新しいカテゴリ");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // モーダルが閉じる
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("カテゴリ名を入力")).not.toBeInTheDocument();
      });
    });
  });

  describe("編集", () => {
    it("編集ボタンをクリックすると編集モーダルが開く", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // 最初のカテゴリの編集ボタンをクリック
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // 編集モーダルが開く（既存データが表示される）
      expect(screen.getByDisplayValue("カテゴリ1")).toBeInTheDocument();
    });

    it("編集モーダルに既存データが表示される", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // 最初のカテゴリの編集ボタンをクリック
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // 既存データが表示される
      expect(screen.getByDisplayValue("カテゴリ1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("説明1")).toBeInTheDocument();
    });

    it("カテゴリを編集できる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // カテゴリ名を変更
      const nameInput = screen.getByDisplayValue("カテゴリ1");
      await user.clear(nameInput);
      await user.type(nameInput, "更新されたカテゴリ");

      // 更新ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /更新/i });
      await user.click(submitButton);

      // submitとrefreshが呼ばれる
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("編集成功後、モーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // カテゴリ名を変更
      const nameInput = screen.getByDisplayValue("カテゴリ1");
      await user.clear(nameInput);
      await user.type(nameInput, "更新されたカテゴリ");

      // 更新ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /更新/i });
      await user.click(submitButton);

      // モーダルが閉じる（カテゴリ名入力フィールドがなくなる）
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("カテゴリ名を入力")).not.toBeInTheDocument();
      });
    });
  });

  describe("削除", () => {
    it("削除ボタンをクリックすると削除処理が実行される", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // 最初のカテゴリの削除ボタンをクリック
      const deleteButtons = screen.getAllByText("削除");
      await user.click(deleteButtons[0]);

      // 削除処理が実行される
      expect(mockDelete).toHaveBeenCalledWith(mockCategories[0]);
    });
  });

  describe("モーダル操作", () => {
    it("キャンセルボタンでモーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      // モーダルが閉じる
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("カテゴリ名を入力")).not.toBeInTheDocument();
      });
    });

    it("モーダルを閉じると編集データがクリアされる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryPageClient initialData={mockCategories} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);
      expect(screen.getByDisplayValue("カテゴリ1")).toBeInTheDocument();

      // モーダルを閉じる
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      // 新規作成モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // 編集データはクリアされている（作成モーダルになっている）
      expect(screen.getByPlaceholderText("カテゴリ名を入力")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("カテゴリ1")).not.toBeInTheDocument();
    });
  });
});
