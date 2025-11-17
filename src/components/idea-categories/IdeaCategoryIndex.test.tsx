import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaCategoryIndex from "./IdeaCategoryIndex";
import { IdeaCategoryListItem } from "@/types/idea-category";

// モック設定
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// IntersectionObserverのモック
class IntersectionObserverMock {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

describe("IdeaCategoryIndex", () => {
  const mockCategories: IdeaCategoryListItem[] = [
    { id: 1, name: "カテゴリ1", description: "説明1", created_at: new Date() },
    { id: 2, name: "カテゴリ2", description: "説明2", created_at: new Date() },
    { id: 3, name: "カテゴリ3", description: "説明3", created_at: new Date() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("カテゴリ一覧が表示される", () => {
      render(<IdeaCategoryIndex initialData={mockCategories} />);

      expect(screen.getByText("カテゴリ1")).toBeInTheDocument();
      expect(screen.getByText("カテゴリ2")).toBeInTheDocument();
      expect(screen.getByText("カテゴリ3")).toBeInTheDocument();
    });
  });

  describe("検索機能", () => {
    it("検索ボックスに入力すると、結果がフィルタリングされる", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryIndex initialData={mockCategories} />);

      // 検索ボックスを取得
      const searchInput = screen.getByPlaceholderText("カテゴリ名で検索...");
      await user.type(searchInput, "カテゴリ1");

      // カテゴリ1のみ表示される
      expect(screen.getByText("カテゴリ1")).toBeInTheDocument();
      expect(screen.queryByText("カテゴリ2")).not.toBeInTheDocument();
      expect(screen.queryByText("カテゴリ3")).not.toBeInTheDocument();
    });

    it("検索結果が0件の場合、メッセージが表示される", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryIndex initialData={mockCategories} />);

      const searchInput = screen.getByPlaceholderText("カテゴリ名で検索...");
      await user.type(searchInput, "存在しないカテゴリ");

      expect(screen.getByText("検索結果が見つかりません")).toBeInTheDocument();
      expect(
        screen.getByText("存在しないカテゴリに一致するアイデアカテゴリがありません")
      ).toBeInTheDocument();
    });

    it("検索中は検索結果数が表示される", async () => {
      const user = userEvent.setup();

      render(<IdeaCategoryIndex initialData={mockCategories} />);

      const searchInput = screen.getByPlaceholderText("カテゴリ名で検索...");
      await user.type(searchInput, "カテゴリ");

      // 検索結果数が表示される
      expect(screen.getByText(/カテゴリの検索結果:/)).toBeInTheDocument();
    });
  });

  describe("操作", () => {
    it("編集ボタンをクリックすると、onEditが呼ばれる", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(<IdeaCategoryIndex initialData={mockCategories} onEdit={onEdit} />);

      // 最初のカテゴリの編集ボタンをクリック
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockCategories[0]);
    });

    it("削除ボタンをクリックすると、onDeleteが呼ばれる", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(<IdeaCategoryIndex initialData={mockCategories} onDelete={onDelete} />);

      // 最初のカテゴリの削除ボタンをクリック
      const deleteButtons = screen.getAllByText("削除");
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockCategories[0]);
    });
  });

  describe("無限スクロール", () => {
    it("10件以下の場合、無限スクロール要素が表示されない", () => {
      const smallData: IdeaCategoryListItem[] = [];
      for (let i = 0; i < 5; i++) {
        smallData.push({
          id: i + 1,
          name: "カテゴリ" + (i + 1),
          description: "説明" + (i + 1),
          created_at: new Date(),
        });
      }

      render(<IdeaCategoryIndex initialData={smallData} />);

      expect(screen.queryByText("スクロールして続きを読み込む")).not.toBeInTheDocument();
    });

    it("11件以上の場合、無限スクロール要素が表示される", () => {
      const largeData: IdeaCategoryListItem[] = [];
      for (let i = 0; i < 15; i++) {
        largeData.push({
          id: i + 1,
          name: "カテゴリ" + (i + 1),
          description: "説明" + (i + 1),
          created_at: new Date(),
        });
      }

      render(<IdeaCategoryIndex initialData={largeData} />);

      // 最初は10件だけ表示される
      expect(screen.getByText("カテゴリ1")).toBeInTheDocument();
      expect(screen.getByText("カテゴリ10")).toBeInTheDocument();
      expect(screen.queryByText("カテゴリ11")).not.toBeInTheDocument();

      // 無限スクロール要素が表示される
      expect(screen.getByText("スクロールして続きを読み込む")).toBeInTheDocument();
    });

    it("検索中は無限スクロールが無効になる", async () => {
      const user = userEvent.setup();
      const largeData: IdeaCategoryListItem[] = [];
      for (let i = 0; i < 15; i++) {
        largeData.push({
          id: i + 1,
          name: "カテゴリ" + (i + 1),
          description: "説明" + (i + 1),
          created_at: new Date(),
        });
      }

      render(<IdeaCategoryIndex initialData={largeData} />);

      // 検索を実行
      const searchInput = screen.getByPlaceholderText("カテゴリ名で検索...");
      await user.type(searchInput, "カテゴリ");

      // 無限スクロール要素が表示されない
      expect(screen.queryByText("スクロールして続きを読み込む")).not.toBeInTheDocument();
    });
  });
});
