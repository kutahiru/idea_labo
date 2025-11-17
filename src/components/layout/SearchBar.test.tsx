import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  const defaultProps = {
    searchTerm: "",
    onSearchChange: vi.fn(),
  };

  it("検索入力フィールドが表示される", () => {
    render(<SearchBar {...defaultProps} />);

    expect(screen.getByPlaceholderText("検索...")).toBeInTheDocument();
  });

  it("カスタムプレースホルダーが表示される", () => {
    render(<SearchBar {...defaultProps} placeholder="カスタム検索" />);

    expect(screen.getByPlaceholderText("カスタム検索")).toBeInTheDocument();
  });

  it("検索語が表示される", () => {
    render(<SearchBar {...defaultProps} searchTerm="テスト検索" />);

    expect(screen.getByDisplayValue("テスト検索")).toBeInTheDocument();
  });

  it("入力するとonSearchChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} />);

    const input = screen.getByPlaceholderText("検索...");
    await user.type(input, "テスト");

    expect(onSearchChange).toHaveBeenCalled();
  });

  it("検索語がある場合、クリアボタンが表示される", () => {
    render(<SearchBar {...defaultProps} searchTerm="テスト" />);

    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("検索語がない場合、クリアボタンが表示されない", () => {
    render(<SearchBar {...defaultProps} searchTerm="" />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("クリアボタンをクリックすると空文字でonSearchChangeが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} searchTerm="テスト" onSearchChange={onSearchChange} />);

    const clearButton = screen.getByRole("button");
    await user.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("検索結果件数が表示される", () => {
    render(<SearchBar {...defaultProps} searchTerm="テスト" resultCount={5} />);

    expect(screen.getByText("テストの検索結果: 5件")).toBeInTheDocument();
  });

  it("検索語がない場合、検索結果件数が表示されない", () => {
    render(<SearchBar {...defaultProps} searchTerm="" resultCount={5} />);

    expect(screen.queryByText(/検索結果/)).not.toBeInTheDocument();
  });

  it("resultCountがundefinedの場合、検索結果件数が表示されない", () => {
    render(<SearchBar {...defaultProps} searchTerm="テスト" />);

    expect(screen.queryByText(/検索結果/)).not.toBeInTheDocument();
  });

  it("検索アイコンが表示される", () => {
    const { container } = render(<SearchBar {...defaultProps} />);

    // lucide-reactのSearchアイコンが表示されることを確認
    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
