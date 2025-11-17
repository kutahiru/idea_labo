import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MyPageClient from "./MyPageClient";
import toast from "react-hot-toast";

// モック設定
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    update: vi.fn(),
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

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/lib/client-utils", () => ({
  parseJsonSafe: vi.fn(),
  parseJson: vi.fn(),
}));

describe("MyPageClient", () => {
  const mockUserProfile = {
    id: "user-1",
    name: "テストユーザー",
    email: "test@example.com",
    image: null,
    created_at: new Date("2024-01-01"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("ユーザー情報が表示される", () => {
    render(<MyPageClient initialData={mockUserProfile} />);

    expect(screen.getByText("プロフィール")).toBeInTheDocument();
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();
  });

  it("編集ボタンが表示される", () => {
    render(<MyPageClient initialData={mockUserProfile} />);

    expect(screen.getByRole("button", { name: /編集/i })).toBeInTheDocument();
  });

  it("編集ボタンをクリックするとモーダルが開く", async () => {
    const user = userEvent.setup();
    render(<MyPageClient initialData={mockUserProfile} />);

    const editButton = screen.getByRole("button", { name: /編集/i });
    await user.click(editButton);

    expect(screen.getByText("ユーザー名編集")).toBeInTheDocument();
  });

  it("モーダルでキャンセルをクリックするとモーダルが閉じる", async () => {
    const user = userEvent.setup();
    render(<MyPageClient initialData={mockUserProfile} />);

    // モーダルを開く
    const editButton = screen.getByRole("button", { name: /編集/i });
    await user.click(editButton);

    // キャンセルボタンをクリック
    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await user.click(cancelButton);

    // モーダルが閉じる
    await waitFor(() => {
      expect(screen.queryByText("ユーザー名編集")).not.toBeInTheDocument();
    });
  });

  it("ユーザー情報更新に成功した場合、成功トーストが表示される", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    const updatedUser = { ...mockUserProfile, name: "更新されたユーザー" };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updatedUser),
    } as Response);

    vi.mocked(parseJson).mockResolvedValue(updatedUser);

    render(<MyPageClient initialData={mockUserProfile} />);

    // モーダルを開く
    const editButton = screen.getByRole("button", { name: /編集/i });
    await user.click(editButton);

    // 名前を変更
    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);
    await user.type(nameInput, "更新されたユーザー");

    // 更新ボタンをクリック
    const updateButton = screen.getByRole("button", { name: "更新" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("ユーザー情報を更新しました");
    });
  });

  it("ユーザー情報更新に失敗した場合、エラートーストが表示される", async () => {
    const user = userEvent.setup();
    const { parseJsonSafe } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    vi.mocked(parseJsonSafe).mockResolvedValue({
      error: "更新に失敗しました",
    });

    render(<MyPageClient initialData={mockUserProfile} />);

    // モーダルを開く
    const editButton = screen.getByRole("button", { name: /編集/i });
    await user.click(editButton);

    // 更新ボタンをクリック
    const updateButton = screen.getByRole("button", { name: "更新" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("更新に失敗しました");
    });
  });

  it("ネットワークエラーの場合、エラートーストが表示される", async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    render(<MyPageClient initialData={mockUserProfile} />);

    // モーダルを開く
    const editButton = screen.getByRole("button", { name: /編集/i });
    await user.click(editButton);

    // 更新ボタンをクリック
    const updateButton = screen.getByRole("button", { name: "更新" });
    await user.click(updateButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  it("更新成功後、画面上のユーザー名が更新される", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    const updatedUser = { ...mockUserProfile, name: "更新されたユーザー" };

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(updatedUser),
    } as Response);

    vi.mocked(parseJson).mockResolvedValue(updatedUser);

    render(<MyPageClient initialData={mockUserProfile} />);

    // 初期状態の確認
    expect(screen.getByText("テストユーザー")).toBeInTheDocument();

    // モーダルを開く
    const editButton = screen.getByRole("button", { name: /編集/i });
    await user.click(editButton);

    // 名前を変更
    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);
    await user.type(nameInput, "更新されたユーザー");

    // 更新ボタンをクリック
    const updateButton = screen.getByRole("button", { name: "更新" });
    await user.click(updateButton);

    // 更新後の確認
    await waitFor(() => {
      expect(screen.getByText("更新されたユーザー")).toBeInTheDocument();
    });
  });
});
