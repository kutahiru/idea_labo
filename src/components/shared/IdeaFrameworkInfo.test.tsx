import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IdeaFrameworkInfo from "./IdeaFrameworkInfo";
import { BaseIdeaListItem } from "@/schemas/idea-framework";

describe("IdeaFrameworkInfo", () => {
  const mockIdeaFramework: BaseIdeaListItem = {
    id: 1,
    title: "テストタイトル",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date("2024-01-01"),
  };

  it("タイトルが表示される", () => {
    render(<IdeaFrameworkInfo ideaFramework={mockIdeaFramework} />);

    expect(screen.getByText("テストタイトル")).toBeInTheDocument();
  });

  it("テーマが表示される", () => {
    render(<IdeaFrameworkInfo ideaFramework={mockIdeaFramework} />);

    expect(screen.getByText("テストテーマ")).toBeInTheDocument();
  });

  it("説明が表示される", () => {
    render(<IdeaFrameworkInfo ideaFramework={mockIdeaFramework} />);

    expect(screen.getByText("テスト説明")).toBeInTheDocument();
  });

  it("説明がnullの場合は説明欄が表示されない", () => {
    const ideaFrameworkWithoutDescription = {
      ...mockIdeaFramework,
      description: null,
    };
    const { container } = render(
      <IdeaFrameworkInfo ideaFramework={ideaFrameworkWithoutDescription} />
    );

    // 説明のコンテナが存在しないことを確認
    const descriptionContainer = container.querySelector(".rounded-lg.border.border-gray-200");
    expect(descriptionContainer).not.toBeInTheDocument();
  });

  it("タイトルに正しいスタイルが適用される", () => {
    render(<IdeaFrameworkInfo ideaFramework={mockIdeaFramework} />);

    const titleElement = screen.getByText("テストタイトル");
    expect(titleElement).toHaveClass("text-primary", "text-3xl", "font-bold");
  });

  it("テーマに正しいスタイルが適用される", () => {
    render(<IdeaFrameworkInfo ideaFramework={mockIdeaFramework} />);

    const themeElement = screen.getByText("テストテーマ");
    expect(themeElement).toHaveClass(
      "text-primary",
      "decoration-accent",
      "text-3xl",
      "font-bold",
      "underline"
    );
  });
});
