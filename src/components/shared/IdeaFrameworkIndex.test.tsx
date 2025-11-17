import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaFrameworkIndex from "./IdeaFrameworkIndex";

// 必要なモック設定
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@/utils/date", () => ({
  formatDate: () => "2024-01-01",
}));

vi.mock("@/hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: ({ allData }: { allData: unknown[] }) => ({
    displayedData: allData.slice(0, 10),
    loading: false,
    observerRef: { current: null },
    hasMore: allData.length > 10,
  }),
}));

vi.mock("@/hooks/useSearch", () => ({
  useSearch: ({ data }: { data: unknown[] }) => ({
    searchTerm: "",
    setSearchTerm: vi.fn(),
    filteredData: data,
  }),
}));

describe("IdeaFrameworkIndex", () => {
  const mockData = [
    {
      id: 1,
      title: "アイテム1",
      themeName: "テーマ1",
      description: "説明1",
      userId: "user-1",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: 2,
      title: "アイテム2",
      themeName: "テーマ2",
      description: "説明2",
      userId: "user-1",
      createdAt: new Date("2024-01-02"),
    },
  ];

  const defaultProps = {
    frameworkType: "mandalart" as const,
    initialData: mockData,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  it("検索バーが表示される", () => {
    render(<IdeaFrameworkIndex {...defaultProps} />);

    expect(screen.getByPlaceholderText("タイトルまたはテーマで検索...")).toBeInTheDocument();
  });

  it("アイテムが表示される", () => {
    render(<IdeaFrameworkIndex {...defaultProps} />);

    expect(screen.getByText("アイテム1")).toBeInTheDocument();
    expect(screen.getByText("アイテム2")).toBeInTheDocument();
  });

  it("データが空の場合、何も表示されない", () => {
    render(<IdeaFrameworkIndex {...defaultProps} initialData={[]} />);

    expect(screen.queryByText("アイテム1")).not.toBeInTheDocument();
  });

  it("onEditが呼ばれた時、正しいアイテムが渡される", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<IdeaFrameworkIndex {...defaultProps} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole("button", { name: "編集" });
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockData[0]);
  });

  it("onDeleteが呼ばれた時、正しいアイテムが渡される", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<IdeaFrameworkIndex {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole("button", { name: "削除" });
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockData[0]);
  });

  it("getUsageScopeLabelが提供された場合、ラベルが表示される", () => {
    const getUsageScopeLabel = () => "個人";
    render(
      <IdeaFrameworkIndex
        {...defaultProps}
        getUsageScopeLabel={getUsageScopeLabel}
      />
    );

    expect(screen.getAllByText("個人")[0]).toBeInTheDocument();
  });
});
