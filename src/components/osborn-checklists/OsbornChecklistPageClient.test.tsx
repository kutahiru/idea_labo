import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistPageClient from "./OsbornChecklistPageClient";
import { OsbornChecklistListItem } from "@/types/osborn-checklist";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// next/navigationのモック
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// hooksのモック
const mockSubmit = vi.fn();
const mockDelete = vi.fn();
vi.mock("@/hooks/useResourceSubmit", () => ({
  useResourceSubmit: () => mockSubmit,
  useResourceDelete: () => mockDelete,
}));

// IntersectionObserverのモック
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

describe("OsbornChecklistPageClient", () => {
  const mockOsbornChecklists: OsbornChecklistListItem[] = [
    {
      id: 1,
      title: "チェックリスト1",
      themeName: "テーマ1",
      description: "説明1",
      userId: "user-1",
      createdAt: new Date(),
    },
    {
      id: 2,
      title: "チェックリスト2",
      themeName: "テーマ2",
      description: "説明2",
      userId: "user-1",
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue({ id: 1 });
  });

  describe("表示", () => {
    it("新規作成ボタンが表示される", () => {
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      expect(screen.getByRole("button", { name: "新規作成" })).toBeInTheDocument();
    });

    it("チェックリスト一覧が表示される", () => {
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      expect(screen.getByText("チェックリスト1")).toBeInTheDocument();
      expect(screen.getByText("チェックリスト2")).toBeInTheDocument();
    });

    it("テーマ名が表示される", () => {
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      expect(screen.getByText("テーマ1")).toBeInTheDocument();
      expect(screen.getByText("テーマ2")).toBeInTheDocument();
    });
  });

  describe("新規作成", () => {
    it("新規作成ボタンをクリックするとモーダルが開く", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      const createButton = screen.getByRole("button", { name: "新規作成" });
      await user.click(createButton);

      // モーダルが開いたことを確認（タイトル入力欄が表示される）
      expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();
    });

    it("作成後、詳細ページに遷移する", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      const createButton = screen.getByRole("button", { name: "新規作成" });
      await user.click(createButton);

      const titleInput = screen.getByLabelText("タイトル *");
      const themeInput = screen.getByLabelText("テーマ *");

      await user.type(titleInput, "新しいチェックリスト");
      await user.type(themeInput, "新しいテーマ");

      const submitButton = screen.getByRole("button", { name: "確定" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("編集", () => {
    it("編集ボタンをクリックすると編集モーダルが開く", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      const editButtons = screen.getAllByRole("button", { name: "編集" });
      await user.click(editButtons[0]);

      // モーダルが開いて既存データが表示される
      await waitFor(() => {
        expect(screen.getByDisplayValue("チェックリスト1")).toBeInTheDocument();
      });
    });

    it("編集後、ページがリフレッシュされモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      const editButtons = screen.getAllByRole("button", { name: "編集" });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue("チェックリスト1")).toBeInTheDocument();
      });

      const submitButton = screen.getByRole("button", { name: "更新" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalled();
      });
    });
  });

  describe("削除", () => {
    it("削除ボタンをクリックすると削除処理が実行される", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      const deleteButtons = screen.getAllByRole("button", { name: "削除" });
      await user.click(deleteButtons[0]);

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe("モーダル操作", () => {
    it("キャンセルボタンでモーダルが閉じる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      const createButton = screen.getByRole("button", { name: "新規作成" });
      await user.click(createButton);

      expect(screen.getByLabelText("タイトル *")).toBeInTheDocument();

      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByLabelText("タイトル *")).not.toBeInTheDocument();
      });
    });

    it("編集モーダルを閉じて新規作成モーダルを開くと編集データがクリアされる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistPageClient initialData={mockOsbornChecklists} />);

      // 編集モーダルを開く
      const editButtons = screen.getAllByRole("button", { name: "編集" });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue("チェックリスト1")).toBeInTheDocument();
      });

      // キャンセルで閉じる
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      await user.click(cancelButton);

      // 新規作成モーダルを開く
      const createButton = screen.getByRole("button", { name: "新規作成" });
      await user.click(createButton);

      // 空のフォームが表示される
      const titleInput = screen.getByLabelText("タイトル *");
      expect(titleInput).toHaveValue("");
    });
  });

  describe("空データ", () => {
    it("データが空の場合、一覧は空で表示される", () => {
      render(<OsbornChecklistPageClient initialData={[]} />);

      expect(screen.queryByText("チェックリスト1")).not.toBeInTheDocument();
    });
  });
});
