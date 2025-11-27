import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistDetailClient from "./OsbornChecklistDetailClient";
import { OsbornChecklistDetail } from "@/types/osborn-checklist";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// next/navigationのモック
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

// x-postのモック
vi.mock("@/lib/x-post", () => ({
  postOsbornChecklistToX: vi.fn(),
}));

// react-hot-toastのモック
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// useOsbornChecklistAIのモック
vi.mock("@/hooks/useOsbornChecklistAI", () => ({
  useOsbornChecklistAI: () => ({
    isGenerating: false,
    handleAIGenerate: vi.fn(),
  }),
}));

// インポートしてモックを取得
import { postOsbornChecklistToX } from "@/lib/x-post";
import toast from "react-hot-toast";

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("OsbornChecklistDetailClient", () => {
  const mockOsbornChecklistDetail: OsbornChecklistDetail = {
    id: 1,
    title: "テストチェックリスト",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    publicToken: "test-token",
    isResultsPublic: false,
    inputs: [
      {
        id: 1,
        osborn_checklist_id: 1,
        checklist_type: "transfer",
        content: "転用アイデア",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    aiGeneration: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  describe("表示", () => {
    it("チェックリストのタイトルが表示される", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByText("テストチェックリスト")).toBeInTheDocument();
    });

    it("入力データがグリッドに表示される", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByDisplayValue("転用アイデア")).toBeInTheDocument();
    });

    it("X投稿ボタンが表示される", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByRole("button", { name: /公開/i })).toBeInTheDocument();
    });

    it("結果公開トグルが表示される", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByText("結果公開：")).toBeInTheDocument();
    });

    it("AI自動入力ボタンが表示される", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByRole("button", { name: "AIで自動入力" })).toBeInTheDocument();
    });
  });

  describe("X投稿", () => {
    it("結果が非公開の場合、X投稿ボタンが無効化される", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const xPostButton = screen.getByRole("button", { name: /公開/i });
      expect(xPostButton).toBeDisabled();
    });

    it("結果が公開の場合、X投稿ボタンが有効化される", () => {
      const publicChecklist = { ...mockOsbornChecklistDetail, isResultsPublic: true };
      render(<OsbornChecklistDetailClient osbornChecklistDetail={publicChecklist} />);

      const xPostButton = screen.getByRole("button", { name: /公開/i });
      expect(xPostButton).not.toBeDisabled();
    });

    it("X投稿ボタンをクリックするとpostOsbornChecklistToXが呼ばれる", async () => {
      const user = userEvent.setup();
      const publicChecklist = { ...mockOsbornChecklistDetail, isResultsPublic: true };
      render(<OsbornChecklistDetailClient osbornChecklistDetail={publicChecklist} />);

      const xPostButton = screen.getByRole("button", { name: /公開/i });
      await user.click(xPostButton);

      expect(postOsbornChecklistToX).toHaveBeenCalled();
    });
  });

  describe("結果公開トグル", () => {
    it("初期状態が正しく表示される（非公開）", () => {
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByText("結果公開：")).toBeInTheDocument();
      expect(screen.getByText("無効")).toBeInTheDocument();
    });

    it("公開状態の場合、有効と表示される", () => {
      const publicChecklist = { ...mockOsbornChecklistDetail, isResultsPublic: true };
      render(<OsbornChecklistDetailClient osbornChecklistDetail={publicChecklist} />);

      expect(screen.getByText("有効")).toBeInTheDocument();
    });

    it("トグルを変更するとAPIが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const toggleButton = screen.getByText("無効").closest("div")?.querySelector("button");
      if (toggleButton) {
        await user.click(toggleButton);

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            "/api/osborn-checklists/1/results-public",
            expect.objectContaining({
              method: "PATCH",
              body: JSON.stringify({ isResultsPublic: true }),
            })
          );
        });
      }
    });

    it("公開成功時にトーストが表示される", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const toggleButton = screen.getByText("無効").closest("div")?.querySelector("button");
      if (toggleButton) {
        await user.click(toggleButton);

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith("結果を公開しました");
        });
      }
    });

    it("非公開成功時にトーストが表示される", async () => {
      const user = userEvent.setup();
      const publicChecklist = { ...mockOsbornChecklistDetail, isResultsPublic: true };
      render(<OsbornChecklistDetailClient osbornChecklistDetail={publicChecklist} />);

      const toggleButton = screen.getByText("有効").closest("div")?.querySelector("button");
      if (toggleButton) {
        await user.click(toggleButton);

        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith("結果を非公開にしました");
        });
      }
    });

    it("API失敗時にエラートーストが表示される", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "エラーが発生しました" }),
      });

      const user = userEvent.setup();
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const toggleButton = screen.getByText("無効").closest("div")?.querySelector("button");
      if (toggleButton) {
        await user.click(toggleButton);

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalled();
        });
      }
    });
  });

  describe("セル入力", () => {
    it("セルに入力するとAPIが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas[0];

      await user.clear(editableTextarea);
      await user.type(editableTextarea, "新しいアイデア");
      await user.tab();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/osborn-checklists/inputs",
          expect.objectContaining({
            method: "POST",
          })
        );
      });
    });

    it("入力保存失敗時にエラートーストが表示される", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "保存に失敗しました" }),
      });

      const user = userEvent.setup();
      render(<OsbornChecklistDetailClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas[0];

      await user.clear(editableTextarea);
      await user.type(editableTextarea, "新しいアイデア");
      await user.tab();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });
});
