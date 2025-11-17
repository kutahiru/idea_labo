import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    title: "確認",
    message: "この操作を実行しますか？",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("モーダルが開いている時に表示される", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("確認")).toBeInTheDocument();
    expect(screen.getByText("この操作を実行しますか？")).toBeInTheDocument();
  });

  it("モーダルが閉じている時は表示されない", () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("確認")).not.toBeInTheDocument();
  });

  it("デフォルトのボタンラベルが表示される", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByRole("button", { name: "はい" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("カスタムボタンラベルが表示される", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmText="削除する"
        cancelText="戻る"
      />
    );

    expect(screen.getByRole("button", { name: "削除する" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
  });

  it("確認ボタンをクリックするとonConfirmが呼ばれる", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByRole("button", { name: "はい" });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンをクリックするとonCancelが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("オーバーレイをクリックするとonCancelが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = render(<ConfirmModal {...defaultProps} onCancel={onCancel} />);

    const overlay = container.querySelector(".backdrop-blur-sm") as HTMLElement;
    await user.click(overlay);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("複数行のメッセージが正しく表示される", () => {
    const multilineMessage = "1行目\n2行目\n3行目";
    render(<ConfirmModal {...defaultProps} message={multilineMessage} />);

    // 複数行のテキストは個別に確認
    expect(screen.getByText(/1行目/)).toBeInTheDocument();
    expect(screen.getByText(/2行目/)).toBeInTheDocument();
    expect(screen.getByText(/3行目/)).toBeInTheDocument();
  });

  it("cancelTextが空文字列の場合、キャンセルボタンが表示されない", () => {
    render(<ConfirmModal {...defaultProps} cancelText="" />);

    expect(screen.queryByRole("button", { name: "キャンセル" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "はい" })).toBeInTheDocument();
  });
});
