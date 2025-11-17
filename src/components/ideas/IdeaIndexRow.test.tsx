import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaIndexRow from "./IdeaIndexRow";

describe("IdeaIndexRow", () => {
  const mockIdea = {
    id: 1,
    name: "テストアイデア",
    description: "これはテスト用の説明です",
    priority: "high" as const,
  };

  it("アイデアの情報が表示される", () => {
    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} />
        </tbody>
      </table>
    );

    expect(screen.getByText("テストアイデア")).toBeInTheDocument();
    expect(screen.getByText("これはテスト用の説明です")).toBeInTheDocument();
    expect(screen.getByText("高")).toBeInTheDocument();
  });

  it("優先度が中の場合、正しく表示される", () => {
    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} priority="medium" />
        </tbody>
      </table>
    );

    expect(screen.getByText("中")).toBeInTheDocument();
  });

  it("優先度が低の場合、正しく表示される", () => {
    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} priority="low" />
        </tbody>
      </table>
    );

    expect(screen.getByText("低")).toBeInTheDocument();
  });

  it("説明がnullの場合、プレースホルダーが表示される", () => {
    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} description={null} />
        </tbody>
      </table>
    );

    expect(screen.getByText("説明が設定されていません")).toBeInTheDocument();
  });

  it("編集ボタンがクリックされると、onEditが呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} onEdit={onEdit} />
        </tbody>
      </table>
    );

    const editButton = screen.getByText("編集");
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("削除ボタンがクリックされると、onDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} onDelete={onDelete} />
        </tbody>
      </table>
    );

    const deleteButton = screen.getByText("削除");
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("onEditがない場合、編集ボタンが表示されない", () => {
    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} />
        </tbody>
      </table>
    );

    expect(screen.queryByText("編集")).not.toBeInTheDocument();
  });

  it("onDeleteがない場合、削除ボタンが表示されない", () => {
    render(
      <table>
        <tbody>
          <IdeaIndexRow {...mockIdea} />
        </tbody>
      </table>
    );

    expect(screen.queryByText("削除")).not.toBeInTheDocument();
  });
});
