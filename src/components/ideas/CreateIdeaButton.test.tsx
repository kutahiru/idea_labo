import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateIdeaButton from "./CreateIdeaButton";
import toast from "react-hot-toast";

// モック設定
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/lib/client-utils", () => ({
  parseJson: vi.fn(),
}));

vi.mock("@/hooks/useResourceSubmit", () => ({
  useResourceSubmit: () => vi.fn().mockResolvedValue(undefined),
}));

describe("CreateIdeaButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("ボタンが表示される", () => {
    render(<CreateIdeaButton />);

    const button = screen.getByRole("button", { name: "アイデアを登録" });
    expect(button).toBeInTheDocument();
  });

  it("ボタンをクリックするとモーダルが開く", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    // カテゴリ取得APIのモック
    const mockCategories = [
      { id: 1, name: "カテゴリ1", description: null },
      { id: 2, name: "カテゴリ2", description: "説明" },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    } as Response);

    vi.mocked(parseJson).mockResolvedValue(mockCategories);

    render(<CreateIdeaButton />);

    const button = screen.getByRole("button", { name: "アイデアを登録" });
    await user.click(button);

    // モーダルが開く
    await waitFor(() => {
      expect(screen.getByText("アイデアを登録")).toBeInTheDocument();
    });

    // カテゴリ取得APIが呼ばれる
    expect(global.fetch).toHaveBeenCalledWith("/api/idea-categories");
  });

  it("カテゴリ取得に失敗した場合、エラートーストが表示される", async () => {
    const user = userEvent.setup();

    // API失敗をモック
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    render(<CreateIdeaButton />);

    const button = screen.getByRole("button", { name: "アイデアを登録" });
    await user.click(button);

    // エラートーストが表示される
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("カテゴリの読み込みに失敗しました");
    });
  });

  it("カテゴリが既に取得済みの場合、再度APIを呼ばない", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    const mockCategories = [{ id: 1, name: "カテゴリ1", description: null }];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCategories),
    } as Response);

    vi.mocked(parseJson).mockResolvedValue(mockCategories);

    render(<CreateIdeaButton />);

    const button = screen.getByRole("button", { name: "アイデアを登録" });

    // 1回目のクリック
    await user.click(button);
    await waitFor(() => {
      expect(screen.getByText("アイデアを登録")).toBeInTheDocument();
    });

    // キャンセルボタンでモーダルを閉じる
    const cancelButton = screen.getByRole("button", { name: /キャンセル/i });
    await user.click(cancelButton);

    // モーダルが閉じるのを待つ
    await waitFor(() => {
      expect(screen.queryByText("アイデアを登録")).not.toBeInTheDocument();
    });

    // 2回目のクリック
    await user.click(button);

    // fetchは1回しか呼ばれない
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it("カテゴリ読み込み中はボタンが無効化される", async () => {
    const user = userEvent.setup();

    // API呼び出しを遅延させる
    vi.mocked(global.fetch).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response), 100))
    );

    render(<CreateIdeaButton />);

    const button = screen.getByRole("button", { name: "アイデアを登録" });
    await user.click(button);

    // 読み込み中はボタンが無効化される
    expect(button).toBeDisabled();
  });

  it("ネットワークエラーの場合、エラートーストが表示される", async () => {
    const user = userEvent.setup();

    // ネットワークエラーをモック
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    render(<CreateIdeaButton />);

    const button = screen.getByRole("button", { name: "アイデアを登録" });
    await user.click(button);

    // エラートーストが表示される
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });
});
