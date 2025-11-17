import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaIndex from "./IdeaIndex";
import { IdeaListItem } from "@/types/idea";

// モック設定
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
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

describe("IdeaIndex", () => {
  const mockIdeas: IdeaListItem[] = [
    { id: 1, name: "アイデア1", description: "説明1", priority: "high", created_at: new Date() },
    { id: 2, name: "アイデア2", description: "説明2", priority: "medium", created_at: new Date() },
    { id: 3, name: "アイデア3", description: "説明3", priority: "low", created_at: new Date() },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("アイデア一覧が表示される", () => {
      render(<IdeaIndex initialData={mockIdeas} />);

      expect(screen.getByText("アイデア1")).toBeInTheDocument();
      expect(screen.getByText("アイデア2")).toBeInTheDocument();
      expect(screen.getByText("アイデア3")).toBeInTheDocument();
    });

    it("データが空の場合、メッセージが表示される", () => {
      render(<IdeaIndex initialData={[]} />);

      expect(screen.getByText("アイデアがまだありません")).toBeInTheDocument();
      expect(screen.getByText("新規作成ボタンからアイデアを追加してください")).toBeInTheDocument();
    });
  });

  describe("検索機能", () => {
    it("検索ボックスに入力すると、結果がフィルタリングされる", async () => {
      const user = userEvent.setup();

      render(<IdeaIndex initialData={mockIdeas} />);

      // 検索ボックスを取得
      const searchInput = screen.getByPlaceholderText("アイデア名で検索...");
      await user.type(searchInput, "アイデア1");

      // アイデア1のみ表示される
      expect(screen.getByText("アイデア1")).toBeInTheDocument();
      expect(screen.queryByText("アイデア2")).not.toBeInTheDocument();
      expect(screen.queryByText("アイデア3")).not.toBeInTheDocument();
    });

    it("検索結果が0件の場合、メッセージが表示される", async () => {
      const user = userEvent.setup();

      render(<IdeaIndex initialData={mockIdeas} />);

      const searchInput = screen.getByPlaceholderText("アイデア名で検索...");
      await user.type(searchInput, "存在しないアイデア");

      expect(screen.getByText("検索結果が見つかりません")).toBeInTheDocument();
      expect(screen.getByText("存在しないアイデアに一致するアイデアがありません")).toBeInTheDocument();
    });

    it("検索中は検索結果数が表示される", async () => {
      const user = userEvent.setup();

      render(<IdeaIndex initialData={mockIdeas} />);

      const searchInput = screen.getByPlaceholderText("アイデア名で検索...");
      await user.type(searchInput, "アイデア");

      // 検索結果数が表示される
      expect(screen.getByText(/アイデアの検索結果:/)).toBeInTheDocument();
    });
  });

  describe("ソート機能", () => {
    it("重要度ボタンをクリックすると降順（高→中→低）にソートされる", async () => {
      const user = userEvent.setup();

      render(<IdeaIndex initialData={mockIdeas} />);

      // 重要度ボタンをクリック
      const sortButton = screen.getByRole("button", { name: /重要度/ });
      await user.click(sortButton);

      // tbody内の行を取得
      const table = screen.getByRole("table");
      const tbody = within(table).getAllByRole("rowgroup")[1]; // thead=0, tbody=1
      const rows = within(tbody).getAllByRole("row");

      // 高→中→低の順
      expect(within(rows[0]).getByText("高")).toBeInTheDocument();
      expect(within(rows[1]).getByText("中")).toBeInTheDocument();
      expect(within(rows[2]).getByText("低")).toBeInTheDocument();
    });

    it("重要度ボタンを2回クリックすると昇順（低→中→高）にソートされる", async () => {
      const user = userEvent.setup();

      render(<IdeaIndex initialData={mockIdeas} />);

      const sortButton = screen.getByRole("button", { name: /重要度/ });

      // 1回目: 降順
      await user.click(sortButton);
      // 2回目: 昇順
      await user.click(sortButton);

      const table = screen.getByRole("table");
      const tbody = within(table).getAllByRole("rowgroup")[1];
      const rows = within(tbody).getAllByRole("row");

      // 低→中→高の順
      expect(within(rows[0]).getByText("低")).toBeInTheDocument();
      expect(within(rows[1]).getByText("中")).toBeInTheDocument();
      expect(within(rows[2]).getByText("高")).toBeInTheDocument();
    });

    it("重要度ボタンを3回クリックするとソートが解除される", async () => {
      const user = userEvent.setup();

      render(<IdeaIndex initialData={mockIdeas} />);

      const sortButton = screen.getByRole("button", { name: /重要度/ });

      // 3回クリック
      await user.click(sortButton);
      await user.click(sortButton);
      await user.click(sortButton);

      // 元の順序（id順）
      const table = screen.getByRole("table");
      const tbody = within(table).getAllByRole("rowgroup")[1];
      const rows = within(tbody).getAllByRole("row");

      expect(within(rows[0]).getByText("アイデア1")).toBeInTheDocument();
      expect(within(rows[1]).getByText("アイデア2")).toBeInTheDocument();
      expect(within(rows[2]).getByText("アイデア3")).toBeInTheDocument();
    });
  });

  describe("操作", () => {
    it("編集ボタンをクリックすると、onEditが呼ばれる", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(<IdeaIndex initialData={mockIdeas} onEdit={onEdit} />);

      // 最初のアイデアの編集ボタンをクリック
      const editButtons = screen.getAllByText("編集");
      await user.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockIdeas[0]);
    });

    it("削除ボタンをクリックすると、onDeleteが呼ばれる", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(<IdeaIndex initialData={mockIdeas} onDelete={onDelete} />);

      // 最初のアイデアの削除ボタンをクリック
      const deleteButtons = screen.getAllByText("削除");
      await user.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockIdeas[0]);
    });
  });

  describe("無限スクロール", () => {
    it("20件以下の場合、無限スクロール要素が表示されない", () => {
      const smallData: IdeaListItem[] = [];
      for (let i = 0; i < 10; i++) {
        smallData.push({
          id: i + 1,
          name: `アイデア` + (i + 1),
          description: `説明` + (i + 1),
          priority: "medium" as const,
          created_at: new Date(),
        });
      }

      render(<IdeaIndex initialData={smallData} />);

      expect(screen.queryByText("スクロールして続きを読み込む")).not.toBeInTheDocument();
    });

    it("21件以上の場合、無限スクロール要素が表示される", () => {
      const largeData: IdeaListItem[] = [];
      for (let i = 0; i < 25; i++) {
        largeData.push({
          id: i + 1,
          name: `アイデア` + (i + 1),
          description: `説明` + (i + 1),
          priority: "medium" as const,
          created_at: new Date(),
        });
      }

      render(<IdeaIndex initialData={largeData} />);

      // 最初は20件だけ表示される
      expect(screen.getByText("アイデア1")).toBeInTheDocument();
      expect(screen.getByText("アイデア20")).toBeInTheDocument();
      expect(screen.queryByText("アイデア21")).not.toBeInTheDocument();

      // 無限スクロール要素が表示される
      expect(screen.getByText("スクロールして続きを読み込む")).toBeInTheDocument();
    });

    it("検索中は無限スクロールが無効になる", async () => {
      const user = userEvent.setup();
      const largeData: IdeaListItem[] = [];
      for (let i = 0; i < 25; i++) {
        largeData.push({
          id: i + 1,
          name: `アイデア` + (i + 1),
          description: `説明` + (i + 1),
          priority: "medium" as const,
          created_at: new Date(),
        });
      }

      render(<IdeaIndex initialData={largeData} />);

      // 検索を実行
      const searchInput = screen.getByPlaceholderText("アイデア名で検索...");
      await user.type(searchInput, "アイデア");

      // 無限スクロール要素が表示されない
      expect(screen.queryByText("スクロールして続きを読み込む")).not.toBeInTheDocument();
    });
  });
});
