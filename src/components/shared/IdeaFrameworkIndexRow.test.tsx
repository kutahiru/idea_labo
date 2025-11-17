import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaFrameworkIndexRow from "./IdeaFrameworkIndexRow";

// next/linkのモック
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// date utilsのモック
vi.mock("@/utils/date", () => ({
  formatDate: () => "2024-01-01",
}));

describe("IdeaFrameworkIndexRow", () => {
  const defaultProps = {
    frameworkType: "mandalart" as const,
    id: 1,
    title: "テストタイトル",
    themeName: "テストテーマ",
    description: "テスト説明",
    createdAt: new Date("2024-01-01"),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("タイトルが表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} />);

    expect(screen.getByText("テストタイトル")).toBeInTheDocument();
  });

  it("テーマが表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} />);

    expect(screen.getByText("テストテーマ")).toBeInTheDocument();
  });

  it("説明が表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} />);

    expect(screen.getByText("テスト説明")).toBeInTheDocument();
  });

  it("説明がnullの場合、デフォルトメッセージが表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} description={null} />);

    expect(screen.getByText("説明が設定されていません")).toBeInTheDocument();
  });

  it("作成日が表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} />);

    expect(screen.getByText("2024-01-01")).toBeInTheDocument();
  });

  it("詳細ボタンが正しいリンクを持つ", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} />);

    const detailLink = screen.getByRole("link", { name: "詳細" });
    expect(detailLink).toHaveAttribute("href", "/mandalarts/1");
  });

  it("編集ボタンをクリックするとonEditが呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<IdeaFrameworkIndexRow {...defaultProps} onEdit={onEdit} />);

    const editButton = screen.getByRole("button", { name: "編集" });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンをクリックするとonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<IdeaFrameworkIndexRow {...defaultProps} onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("usageScopeLabelが提供された場合、表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} usageScopeLabel="個人" />);

    expect(screen.getByText("個人")).toBeInTheDocument();
  });

  it("onEditが提供されない場合でも、編集ボタンは表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} onEdit={undefined} />);

    expect(screen.getByRole("button", { name: "編集" })).toBeInTheDocument();
  });

  it("onDeleteが提供されない場合でも、削除ボタンは表示される", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} onDelete={undefined} />);

    expect(screen.getByRole("button", { name: "削除" })).toBeInTheDocument();
  });

  it("brainwritingの場合、正しいリンクを持つ", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} frameworkType="brainwriting" />);

    const detailLink = screen.getByRole("link", { name: "詳細" });
    expect(detailLink).toHaveAttribute("href", "/brainwritings/1");
  });

  it("osborn_checklistの場合、正しいリンクを持つ", () => {
    render(<IdeaFrameworkIndexRow {...defaultProps} frameworkType="osborn_checklist" />);

    const detailLink = screen.getByRole("link", { name: "詳細" });
    expect(detailLink).toHaveAttribute("href", "/osborn-checklists/1");
  });
});
