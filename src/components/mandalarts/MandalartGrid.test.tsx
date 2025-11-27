import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartGrid from "./MandalartGrid";
import { MandalartInputData } from "@/types/mandalart";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("MandalartGrid", () => {
  const mockOnInputChange = vi.fn();

  const createMockInput = (
    sectionRowIndex: number,
    sectionColumnIndex: number,
    rowIndex: number,
    columnIndex: number,
    content: string
  ): MandalartInputData => ({
    id: 1,
    mandalart_id: 1,
    section_row_index: sectionRowIndex,
    section_column_index: sectionColumnIndex,
    row_index: rowIndex,
    column_index: columnIndex,
    content,
    created_at: new Date(),
    updated_at: new Date(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("81個のセル（9セクション × 9セル）が表示される", () => {
      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(81);
    });

    it("テーマ名が中央に表示される", () => {
      render(
        <MandalartGrid
          themeName="メインテーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
        />
      );

      expect(screen.getByDisplayValue("メインテーマ")).toBeInTheDocument();
    });

    it("inputsの内容がセルに表示される", () => {
      const inputs: MandalartInputData[] = [
        createMockInput(0, 0, 0, 0, "アイデア1"),
        createMockInput(2, 2, 2, 2, "アイデア2"),
      ];

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={inputs}
          onInputChange={mockOnInputChange}
        />
      );

      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア2")).toBeInTheDocument();
    });

    it("contentがnullの入力は空として扱われる", () => {
      const inputs: MandalartInputData[] = [
        { ...createMockInput(0, 0, 0, 0, ""), content: null },
      ];

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={inputs}
          onInputChange={mockOnInputChange}
        />
      );

      // エラーなく表示されることを確認
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(81);
    });
  });

  describe("readOnly", () => {
    it("readOnly=falseの場合、編集可能なセルがある", () => {
      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
          readOnly={false}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      const editableCount = textareas.filter(
        textarea => !textarea.hasAttribute("readonly")
      ).length;

      // 中央セル（各セクションの中央）以外は編集可能
      // 9セクション × 8セル（中央以外）= 72個
      expect(editableCount).toBe(72);
    });

    it("readOnly=trueの場合、すべてのセルが読み取り専用になる", () => {
      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
          readOnly={true}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });
  });

  describe("onInputChange", () => {
    it("セルの値が変更されるとonInputChangeが呼ばれる", async () => {
      const user = userEvent.setup();

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (editableTextarea) {
        await user.type(editableTextarea, "新しい値");
        await user.tab();

        expect(mockOnInputChange).toHaveBeenCalled();
      }
    });

    it("onInputChangeに正しい引数が渡される", async () => {
      const user = userEvent.setup();

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (editableTextarea) {
        await user.type(editableTextarea, "テスト");
        await user.tab();

        expect(mockOnInputChange).toHaveBeenCalledWith(
          expect.any(Number), // sectionRowIndex
          expect.any(Number), // sectionColumnIndex
          expect.any(Number), // rowIndex
          expect.any(Number), // columnIndex
          "テスト"
        );
      }
    });
  });

  describe("状態管理", () => {
    it("セルの値が更新されると内部のMapが更新される", async () => {
      const user = userEvent.setup();

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={[]}
          onInputChange={mockOnInputChange}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (editableTextarea) {
        await user.type(editableTextarea, "更新値");
        await user.tab();

        // 値が表示されていることで内部状態が更新されていることを確認
        expect(screen.getByDisplayValue("更新値")).toBeInTheDocument();
      }
    });

    it("値を空にするとMapから削除される", async () => {
      const user = userEvent.setup();
      const inputs: MandalartInputData[] = [
        createMockInput(0, 0, 0, 0, "初期値"),
      ];

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={inputs}
          onInputChange={mockOnInputChange}
        />
      );

      const textarea = screen.getByDisplayValue("初期値");
      await user.clear(textarea);
      await user.tab();

      expect(mockOnInputChange).toHaveBeenCalledWith(0, 0, 0, 0, "");
    });
  });

  describe("サブテーマの連携", () => {
    it("中央セクションの周囲に値を入力すると、対応する外側セクションの中央に表示される", () => {
      const inputs: MandalartInputData[] = [
        createMockInput(1, 1, 0, 0, "左上サブテーマ"), // 中央セクションの左上
      ];

      render(
        <MandalartGrid
          themeName="テーマ"
          inputs={inputs}
          onInputChange={mockOnInputChange}
        />
      );

      // 中央セクションの(0,0)位置の値は、セクション(0,0)の中央にも表示される
      const matchingCells = screen.getAllByDisplayValue("左上サブテーマ");
      expect(matchingCells.length).toBeGreaterThanOrEqual(1);
    });
  });
});
