import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToggleSwitch from "./ToggleSwitch";

describe("ToggleSwitch", () => {
  const defaultProps = {
    label: "テスト設定",
    checked: false,
    onChange: vi.fn(),
  };

  it("ラベルが表示される", () => {
    render(<ToggleSwitch {...defaultProps} />);

    expect(screen.getByText("テスト設定：")).toBeInTheDocument();
  });

  it("チェック状態がfalseの時、「無効」と表示される", () => {
    render(<ToggleSwitch {...defaultProps} checked={false} />);

    expect(screen.getByText("無効")).toBeInTheDocument();
  });

  it("チェック状態がtrueの時、「有効」と表示される", () => {
    render(<ToggleSwitch {...defaultProps} checked={true} />);

    expect(screen.getByText("有効")).toBeInTheDocument();
  });

  it("スイッチをクリックするとonChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

    const switchButton = screen.getByRole("button");
    await user.click(switchButton);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("チェック状態がtrueの時にクリックするとfalseを渡す", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} checked={true} onChange={onChange} />);

    const switchButton = screen.getByRole("button");
    await user.click(switchButton);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("disabledがtrueの時、ボタンが無効化される", () => {
    render(<ToggleSwitch {...defaultProps} disabled={true} />);

    const switchButton = screen.getByRole("button");
    expect(switchButton).toBeDisabled();
  });

  it("disabledがtrueの時、クリックしてもonChangeが呼ばれない", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} disabled={true} onChange={onChange} />);

    const switchButton = screen.getByRole("button");
    await user.click(switchButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("チェック状態がtrueの時、正しいスタイルが適用される", () => {
    render(<ToggleSwitch {...defaultProps} checked={true} />);

    const switchButton = screen.getByRole("button");
    expect(switchButton).toHaveClass("bg-primary");
  });

  it("チェック状態がfalseの時、正しいスタイルが適用される", () => {
    render(<ToggleSwitch {...defaultProps} checked={false} />);

    const switchButton = screen.getByRole("button");
    expect(switchButton).toHaveClass("bg-gray-400");
  });
});
