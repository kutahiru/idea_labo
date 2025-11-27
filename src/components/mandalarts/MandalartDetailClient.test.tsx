import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartDetailClient from "./MandalartDetailClient";
import { MandalartDetail } from "@/types/mandalart";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// x-postのモック
vi.mock("@/lib/x-post", () => ({
  postMandalartToX: vi.fn(),
}));

// react-hot-toastのモック
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// インポートしてモックを取得
import { postMandalartToX } from "@/lib/x-post";
import toast from "react-hot-toast";

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("MandalartDetailClient", () => {
  const mockMandalartDetail: MandalartDetail = {
    id: 1,
    title: "テストマンダラート",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    publicToken: "test-token",
    isResultsPublic: false,
    inputs: [
      {
        id: 1,
        mandalart_id: 1,
        section_row_index: 0,
        section_column_index: 0,
        row_index: 0,
        column_index: 0,
        content: "アイデア1",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  describe("表示", () => {
    it("マンダラートのタイトルが表示される", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByText("テストマンダラート")).toBeInTheDocument();
    });

    it("マンダラートのテーマ名が中央に表示される", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByDisplayValue("テストテーマ")).toBeInTheDocument();
    });

    it("入力データがグリッドに表示される", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
    });

    it("X投稿ボタンが表示される", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByRole("button", { name: /公開/i })).toBeInTheDocument();
    });

    it("結果公開トグルが表示される", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByText("結果公開：")).toBeInTheDocument();
    });
  });

  describe("X投稿", () => {
    it("結果が非公開の場合、X投稿ボタンが無効化される", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      const xPostButton = screen.getByRole("button", { name: /公開/i });
      expect(xPostButton).toBeDisabled();
    });

    it("結果が公開の場合、X投稿ボタンが有効化される", () => {
      const publicMandalart = { ...mockMandalartDetail, isResultsPublic: true };
      render(<MandalartDetailClient mandalartDetail={publicMandalart} />);

      const xPostButton = screen.getByRole("button", { name: /公開/i });
      expect(xPostButton).not.toBeDisabled();
    });

    it("X投稿ボタンをクリックするとpostMandalartToXが呼ばれる", async () => {
      const user = userEvent.setup();
      const publicMandalart = { ...mockMandalartDetail, isResultsPublic: true };
      render(<MandalartDetailClient mandalartDetail={publicMandalart} />);

      const xPostButton = screen.getByRole("button", { name: /公開/i });
      await user.click(xPostButton);

      expect(postMandalartToX).toHaveBeenCalled();
    });
  });

  describe("結果公開トグル", () => {
    it("初期状態が正しく表示される（非公開）", () => {
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      // ToggleSwitchはbuttonとして実装されている
      expect(screen.getByText("結果公開：")).toBeInTheDocument();
      expect(screen.getByText("無効")).toBeInTheDocument();
    });

    it("公開状態の場合、有効と表示される", () => {
      const publicMandalart = { ...mockMandalartDetail, isResultsPublic: true };
      render(<MandalartDetailClient mandalartDetail={publicMandalart} />);

      expect(screen.getByText("有効")).toBeInTheDocument();
    });

    it("トグルを変更するとAPIが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      // 「無効」テキストの近くにあるトグルボタンをクリック
      const toggleButton = screen.getByText("無効").closest("div")?.querySelector("button");
      if (toggleButton) {
        await user.click(toggleButton);

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            "/api/mandalarts/1/results-public",
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
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

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
      const publicMandalart = { ...mockMandalartDetail, isResultsPublic: true };
      render(<MandalartDetailClient mandalartDetail={publicMandalart} />);

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
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

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
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      // 編集可能なセルを探して入力
      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (editableTextarea) {
        await user.type(editableTextarea, "新しい値");
        await user.tab(); // blur

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            "/api/mandalarts/inputs",
            expect.objectContaining({
              method: "POST",
            })
          );
        });
      }
    });

    it("入力保存失敗時にエラートーストが表示される", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "保存に失敗しました" }),
      });

      const user = userEvent.setup();
      render(<MandalartDetailClient mandalartDetail={mockMandalartDetail} />);

      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (editableTextarea) {
        await user.type(editableTextarea, "新しい値");
        await user.tab();

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalled();
        });
      }
    });
  });
});
