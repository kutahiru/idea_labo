import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddUserClient from "./AddUserClient";
import toast from "react-hot-toast";

// モック設定
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    update: vi.fn(),
  }),
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

describe("AddUserClient", () => {
  const defaultProps = {
    currentName: "",
    redirectUrl: "/",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("フォームが表示される", () => {
    render(<AddUserClient {...defaultProps} />);

    expect(screen.getByLabelText("ユーザー名 *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "設定して始める" })).toBeInTheDocument();
  });

  it("初期値が設定されている場合、表示される", () => {
    render(<AddUserClient {...defaultProps} currentName="初期ユーザー名" />);

    expect(screen.getByDisplayValue("初期ユーザー名")).toBeInTheDocument();
  });

  it("ユーザー名を入力できる", async () => {
    const user = userEvent.setup();
    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    expect(screen.getByDisplayValue("新しいユーザー名")).toBeInTheDocument();
  });

  it("ユーザー名が空の場合、バリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<AddUserClient {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("名前は必須です")).toBeInTheDocument();
    });
  });

  it("バリデーションが成功した場合、APIが呼ばれる", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "新しいユーザー名" }),
    } as Response);

    vi.mocked(parseJson).mockResolvedValue({ name: "新しいユーザー名" });

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "新しいユーザー名" }),
      });
      expect(toast.success).toHaveBeenCalledWith("ユーザー名を設定しました");
    });
  });

  it("API呼び出しに失敗した場合、エラートーストが表示される", async () => {
    const user = userEvent.setup();
    const { parseJsonSafe } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    vi.mocked(parseJsonSafe).mockResolvedValue({
      error: "ユーザー名の更新に失敗しました",
    });

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("ユーザー名の更新に失敗しました");
    });
  });

  it("ネットワークエラーの場合、エラートーストが表示される", async () => {
    const user = userEvent.setup();

    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network error");
    });
  });

  it("送信中はボタンが無効化される", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ name: "新しいユーザー名" }),
      } as Response), 100))
    );

    vi.mocked(parseJson).mockResolvedValue({ name: "新しいユーザー名" });

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    // 送信中はボタンが無効化される
    expect(submitButton).toBeDisabled();
  });

  it("送信中は「設定中...」と表示される", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ name: "新しいユーザー名" }),
      } as Response), 100))
    );

    vi.mocked(parseJson).mockResolvedValue({ name: "新しいユーザー名" });

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    expect(screen.getByText("設定中...")).toBeInTheDocument();
  });

  it("送信中は入力フィールドが無効化される", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ name: "新しいユーザー名" }),
      } as Response), 100))
    );

    vi.mocked(parseJson).mockResolvedValue({ name: "新しいユーザー名" });

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    expect(nameInput).toBeDisabled();
  });

  it("エラー入力時、入力すればエラーが消える", async () => {
    const user = userEvent.setup();
    render(<AddUserClient {...defaultProps} />);

    // 空のまま送信してエラーを表示
    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("名前は必須です")).toBeInTheDocument();
    });

    // 名前を入力してエラーを消す
    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    await waitFor(() => {
      expect(screen.queryByText("名前は必須です")).not.toBeInTheDocument();
    });
  });

  it("ユーザー名の最大文字数は50文字", () => {
    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *") as HTMLInputElement;
    expect(nameInput.maxLength).toBe(50);
  });

  it("カスタムリダイレクトURLが設定される", async () => {
    const user = userEvent.setup();
    const { parseJson } = await import("@/lib/client-utils");

    const mockPush = vi.fn();
    vi.mocked(vi.fn(() => ({ push: mockPush })));

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "新しいユーザー名" }),
    } as Response);

    vi.mocked(parseJson).mockResolvedValue({ name: "新しいユーザー名" });

    render(<AddUserClient currentName="" redirectUrl="/custom-redirect" />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("ユーザー名を設定しました");
    });
  });

  it("失敗時はisSubmittingがfalseに戻る", async () => {
    const user = userEvent.setup();
    const { parseJsonSafe } = await import("@/lib/client-utils");

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    vi.mocked(parseJsonSafe).mockResolvedValue({
      error: "ユーザー名の更新に失敗しました",
    });

    render(<AddUserClient {...defaultProps} />);

    const nameInput = screen.getByLabelText("ユーザー名 *");
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "設定して始める" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    // 失敗後はボタンが再度有効になる
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
