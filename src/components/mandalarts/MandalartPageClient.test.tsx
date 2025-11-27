import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartPageClient from "./MandalartPageClient";
import { MandalartListItem } from "@/types/mandalart";

// モック設定
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
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
  useResourceSubmit: (options: { onSuccess?: (isEdit: boolean, result: unknown) => void }) => {
    return async (data: unknown) => {
      const result = await mockSubmit(data);
      if (options.onSuccess) {
        const isEdit = !!(data as { id?: number })?.id;
        options.onSuccess(isEdit, result || { id: 1 });
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

describe("MandalartPageClient", () => {
  const mockMandalarts: MandalartListItem[] = [
    {
      id: 1,
      title: "マンダラート1",
      themeName: "テーマ1",
      description: "説明1",
      userId: "user-1",
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "マンダラート2",
      themeName: "テーマ2",
      description: "説明2",
      userId: "user-1",
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue({ id: 1 });
    mockDelete.mockResolvedValue(undefined);
  });

  describe("表示", () => {
    it("新規作成ボタンが表示される", () => {
      render(<MandalartPageClient initialData={mockMandalarts} />);

      expect(screen.getByRole("button", { name: /新規作成/i })).toBeInTheDocument();
    });

    it("マンダラート一覧が表示される", () => {
      render(<MandalartPageClient initialData={mockMandalarts} />);

      expect(screen.getByText("マンダラート1")).toBeInTheDocument();
      expect(screen.getByText("マンダラート2")).toBeInTheDocument();
    });

    it("テーマ名が表示される", () => {
      render(<MandalartPageClient initialData={mockMandalarts} />);

      expect(screen.getByText("テーマ1")).toBeInTheDocument();
      expect(screen.getByText("テーマ2")).toBeInTheDocument();
    });
  });

  describe("新規作成", () => {
    it("新規作成ボタンをクリックするとモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<MandalartPageClient initialData={mockMandalarts} />);

      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // モーダルが開いたことを確認（タイトルラベルが表示される）
      expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();
    });

    it("作成後、詳細ページに遷移する", async () => {
      const user = userEvent.setup();
      mockSubmit.mockResolvedValue({ id: 123 });

      render(<MandalartPageClient initialData={mockMandalarts} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // タイトルとテーマを入力
      const titleInput = screen.getByLabelText("タイトル *");
      const themeInput = screen.getByLabelText("テーマ *");
      await user.type(titleInput, "新しいマンダラート");
      await user.type(themeInput, "新しいテーマ");

      // 確定
      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/mandalarts/123");
      });
    });
  });

  describe("編集", () => {
    it("編集ボタンをクリックすると編集モーダルが開く", async () => {
      const user = userEvent.setup();
      render(<MandalartPageClient initialData={mockMandalarts} />);

      const editButtons = screen.getAllByRole("button", { name: "編集" });
      await user.click(editButtons[0]);

      // モーダルが開き、既存データが表示されることを確認
      expect(screen.getByDisplayValue("マンダラート1")).toBeInTheDocument();
    });

    it("編集後、ページがリフレッシュされモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<MandalartPageClient initialData={mockMandalarts} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByRole("button", { name: "編集" });
      await user.click(editButtons[0]);

      // タイトルを変更
      const titleInput = screen.getByDisplayValue("マンダラート1");
      await user.clear(titleInput);
      await user.type(titleInput, "更新されたマンダラート");

      // 更新
      const submitButton = screen.getByRole("button", { name: "更新" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("削除", () => {
    it("削除ボタンをクリックすると削除処理が実行される", async () => {
      const user = userEvent.setup();
      render(<MandalartPageClient initialData={mockMandalarts} />);

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });
      await user.click(deleteButtons[0]);

      expect(mockDelete).toHaveBeenCalledWith(mockMandalarts[0]);
    });
  });

  describe("モーダル操作", () => {
    it("キャンセルボタンでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<MandalartPageClient initialData={mockMandalarts} />);

      // モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();

      // キャンセル
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText("タイトル *")).not.toBeInTheDocument();
      });
    });

    it("編集モーダルを閉じて新規作成モーダルを開くと編集データがクリアされる", async () => {
      const user = userEvent.setup();
      render(<MandalartPageClient initialData={mockMandalarts} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByRole("button", { name: "編集" });
      await user.click(editButtons[0]);
      expect(screen.getByDisplayValue("マンダラート1")).toBeInTheDocument();

      // キャンセル
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      // 新規作成モーダルを開く
      const createButton = screen.getByRole("button", { name: /新規作成/i });
      await user.click(createButton);

      // 編集データはクリアされている
      expect(screen.queryByDisplayValue("マンダラート1")).not.toBeInTheDocument();
    });
  });

  describe("空データ", () => {
    it("データが空の場合、一覧は空で表示される", () => {
      render(<MandalartPageClient initialData={[]} />);

      expect(screen.getByRole("button", { name: /新規作成/i })).toBeInTheDocument();
      expect(screen.queryByText("マンダラート1")).not.toBeInTheDocument();
    });
  });
});
