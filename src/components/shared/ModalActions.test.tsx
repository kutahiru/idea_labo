import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModalActions } from "./ModalActions";

describe("ModalActions", () => {
  const defaultProps = {
    onClose: vi.fn(),
    isSubmitting: false,
    mode: "create" as const,
  };

  it("作成モードで正しいラベルが表示される", () => {
    render(<ModalActions {...defaultProps} />);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "確定" })).toBeInTheDocument();
  });

  it("編集モードで正しいラベルが表示される", () => {
    render(<ModalActions {...defaultProps} mode="edit" />);

    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("カスタムラベルが表示される", () => {
    const customLabel = { create: "作成", edit: "変更" };
    render(<ModalActions {...defaultProps} submitLabel={customLabel} />);

    expect(screen.getByRole("button", { name: "作成" })).toBeInTheDocument();
  });

  it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModalActions {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("送信中はボタンが無効化される", () => {
    render(<ModalActions {...defaultProps} isSubmitting={true} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    const submitButton = screen.getByRole("button", { name: "保存中..." });

    expect(cancelButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("送信中はローディングアイコンとテキストが表示される", () => {
    render(<ModalActions {...defaultProps} isSubmitting={true} />);

    expect(screen.getByText("保存中...")).toBeInTheDocument();
  });
});
