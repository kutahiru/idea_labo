import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserEditModal from "./UserEditModal";
import { UserFormData } from "@/schemas/user";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("UserEditModal", () => {
  const initialData: UserFormData = {
    name: "テストユーザー",
  };

  const defaultProps = {
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined) as (data: UserFormData) => Promise<void>,
    initialData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("モーダルが表示される", () => {
    render(<UserEditModal {...defaultProps} />);

    expect(screen.getByText("ユーザー名編集")).toBeInTheDocument();
  });

  it("初期データが正しく表示される", () => {
    render(<UserEditModal {...defaultProps} />);

    expect(screen.getByDisplayValue("テストユーザー")).toBeInTheDocument();
  });

  it("名前を変更できる", async () => {
    const user = userEvent.setup();
    render(<UserEditModal {...defaultProps} />);

    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);
    await user.type(nameInput, "新しいユーザー名");

    expect(screen.getByDisplayValue("新しいユーザー名")).toBeInTheDocument();
  });

  it("名前が空の場合、バリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<UserEditModal {...defaultProps} />);

    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("名前は必須です")).toBeInTheDocument();
    });
  });

  it("バリデーションが成功した場合、onSubmitが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined) as (data: UserFormData) => Promise<void>;
    render(<UserEditModal {...defaultProps} onSubmit={onSubmit} />);

    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);
    await user.type(nameInput, "新しいユーザー名");

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ name: "新しいユーザー名" });
    });
  });

  it("送信成功後、onCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined) as (data: UserFormData) => Promise<void>;
    render(<UserEditModal {...defaultProps} onClose={onClose} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UserEditModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("オーバーレイをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<UserEditModal {...defaultProps} onClose={onClose} />);

    const overlay = container.querySelector(".backdrop-blur-sm") as HTMLElement;
    await user.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it("送信中はボタンが無効化される", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100))) as (data: UserFormData) => Promise<void>;
    render(<UserEditModal {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    expect(cancelButton).toBeDisabled();
  });

  it("送信中は「保存中...」と表示される", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100))) as (data: UserFormData) => Promise<void>;
    render(<UserEditModal {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    expect(screen.getByText("保存中...")).toBeInTheDocument();
  });

  it("エラー入力時、入力すればエラーが消える", async () => {
    const user = userEvent.setup();
    render(<UserEditModal {...defaultProps} />);

    // 名前を空にしてエラーを表示
    const nameInput = screen.getByLabelText("名前 *");
    await user.clear(nameInput);

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("名前は必須です")).toBeInTheDocument();
    });

    // 名前を入力してエラーを消す
    await user.type(nameInput, "新しいユーザー名");

    await waitFor(() => {
      expect(screen.queryByText("名前は必須です")).not.toBeInTheDocument();
    });
  });

  it("名前の最大文字数は50文字", () => {
    render(<UserEditModal {...defaultProps} />);

    const nameInput = screen.getByLabelText("名前 *") as HTMLInputElement;
    expect(nameInput.maxLength).toBe(50);
  });

  it("送信中は入力フィールドが無効化される", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(() => new Promise((resolve) => setTimeout(resolve, 100))) as (data: UserFormData) => Promise<void>;
    render(<UserEditModal {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "更新" });
    await user.click(submitButton);

    const nameInput = screen.getByLabelText("名前 *");
    expect(nameInput).toBeDisabled();
  });
});
