import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaCategoryIndexRow from "./IdeaCategoryIndexRow";

// framer-motionをモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("IdeaCategoryIndexRow", () => {
  const mockCategory = {
    id: 1,
    name: "テストカテゴリ",
    description: "これはテスト用の説明です",
    created_at: new Date(),
  };

  it("カテゴリの情報が表示される", () => {
    render(<IdeaCategoryIndexRow {...mockCategory} />);

    expect(screen.getByText("テストカテゴリ")).toBeInTheDocument();
    expect(screen.getByText("これはテスト用の説明です")).toBeInTheDocument();
  });

  it("説明がnullの場合、プレースホルダーが表示される", () => {
    render(<IdeaCategoryIndexRow {...mockCategory} description={null} />);

    expect(screen.getByText("説明が設定されていません")).toBeInTheDocument();
  });

  it("アイデア一覧リンクが表示される", () => {
    render(<IdeaCategoryIndexRow {...mockCategory} />);

    const link = screen.getByRole("link", { name: "アイデア一覧" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/idea-categories/1");
  });

  it("編集ボタンがクリックされると、onEditが呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(<IdeaCategoryIndexRow {...mockCategory} onEdit={onEdit} />);

    const editButton = screen.getByText("編集");
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンがクリックされると、onDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<IdeaCategoryIndexRow {...mockCategory} onDelete={onDelete} />);

    const deleteButton = screen.getByText("削除");
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("onEditがない場合、編集ボタンが表示されない", () => {
    render(<IdeaCategoryIndexRow {...mockCategory} />);

    expect(screen.queryByText("編集")).not.toBeInTheDocument();
  });

  it("onDeleteがない場合、削除ボタンが表示されない", () => {
    render(<IdeaCategoryIndexRow {...mockCategory} />);

    expect(screen.queryByText("削除")).not.toBeInTheDocument();
  });
});
