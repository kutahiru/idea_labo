import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaPageClient from "./IdeaPageClient";
import { IdeaListItem } from "@/types/idea";

// モック設定
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("@/hooks/useResourceSubmit", () => ({
  useResourceSubmit: (options: { onSuccess?: () => void }) => {
    return async (data: unknown) => {
      await mockSubmit(data);
      // onSuccessコールバックを実行
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

const mockRefresh = vi.fn();
const mockSubmit = vi.fn();
const mockDelete = vi.fn();

describe("IdeaPageClient", () => {
  const mockIdeas: IdeaListItem[] = [
    { id: 1, name: "アイデア1", description: "説明1", priority: "high", created_at: new Date() },
    { id: 2, name: "アイデア2", description: "説明2", priority: "medium", created_at: new Date() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);
  });

  describe("表示", () => {
    it("タイトルが表示される", () => {
      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      expect(screen.getByText("アイデア一覧")).toBeInTheDocument();
    });

    it("新規作成ボタンが表示される", () => {
      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      expect(screen.getByRole("button", { name: /新規作成/i })).toBeInTheDocument();
    });

    it("アイデア一覧が表示される", () => {
      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // モバイル用カードとPC用テーブルの両方に表示されるため、getAllByTextを使用
      expect(screen.getAllByText("アイデア1").length).toBeGreaterThan(0);
      expect(screen.getAllByText("アイデア2").length).toBeGreaterThan(0);
    });
  });

  describe("新規作成", () => {
    it("新規作成ボタンをクリックするとモーダルが開く", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // モーダルが開く
      expect(screen.getByText("アイデアを登録")).toBeInTheDocument();
    });

    it("新規作成モーダルではカテゴリフィールドが表示されない", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // カテゴリフィールドは表示されない（fixedCategoryIdが設定されているため）
      expect(screen.queryByText("カテゴリ *")).not.toBeInTheDocument();
    });

    it("新規作成でアイデアを登録できる", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // アイデア名を入力
      const nameInput = screen.getByPlaceholderText("アイデア名を入力");
      await user.type(nameInput, "新しいアイデア");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // submitが呼ばれる
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("登録成功後、モーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // アイデア名を入力
      const nameInput = screen.getByPlaceholderText("アイデア名を入力");
      await user.type(nameInput, "新しいアイデア");

      // 確定ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /確定/i });
      await user.click(submitButton);

      // モーダルが閉じる
      await waitFor(() => {
        expect(screen.queryByText("アイデアを登録")).not.toBeInTheDocument();
      });
    });
  });

  describe("編集", () => {
    it("編集ボタンをクリックすると編集モーダルが開く", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // 最初のアイデアの編集ボタンをクリック
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // 編集モーダルが開く
      expect(screen.getByText("アイデアを編集")).toBeInTheDocument();
    });

    it("編集モーダルに既存データが表示される", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // 最初のアイデアの編集ボタンをクリック
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // 既存データが表示される
      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("説明1")).toBeInTheDocument();
    });

    it("アイデアを編集できる", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // アイデア名を変更
      const nameInput = screen.getByDisplayValue("アイデア1");
      await user.clear(nameInput);
      await user.type(nameInput, "更新されたアイデア");

      // 更新ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /更新/i });
      await user.click(submitButton);

      // submitが呼ばれる
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("編集成功後、モーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      // アイデア名を変更
      const nameInput = screen.getByDisplayValue("アイデア1");
      await user.clear(nameInput);
      await user.type(nameInput, "更新されたアイデア");

      // 更新ボタンをクリック
      const submitButton = screen.getByRole("button", { name: /更新/i });
      await user.click(submitButton);

      // モーダルが閉じる
      await waitFor(() => {
        expect(screen.queryByText("アイデアを編集")).not.toBeInTheDocument();
      });
    });
  });

  describe("削除", () => {
    it("削除ボタンをクリックすると削除処理が実行される", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // 最初のアイデアの削除ボタンをクリック
      const deleteButtons = screen.getAllByText("削除");
      await user.click(deleteButtons[0]);

      // 削除処理が実行される
      expect(mockDelete).toHaveBeenCalledWith(mockIdeas[0]);
    });
  });

  describe("モーダル操作", () => {
    it("キャンセルボタンでモーダルが閉じる", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // キャンセルボタンをクリック
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      // モーダルが閉じる
      await waitFor(() => {
        expect(screen.queryByText("アイデアを登録")).not.toBeInTheDocument();
      });
    });

    it("モーダルを閉じると編集データがクリアされる", async () => {
      const user = userEvent.setup();

      render(<IdeaPageClient initialData={mockIdeas} categoryId={1} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);
      expect(screen.getByText("アイデアを編集")).toBeInTheDocument();

      // モーダルを閉じる
      const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
      await user.click(cancelButton);

      // 新規作成モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // 編集データはクリアされている（作成モーダルになっている）
      expect(screen.getByText("アイデアを登録")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("アイデア1")).not.toBeInTheDocument();
    });
  });
});
