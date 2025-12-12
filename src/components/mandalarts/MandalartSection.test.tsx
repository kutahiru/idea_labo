import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartSection from "./MandalartSection";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("MandalartSection", () => {
  const mockOnCellChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("9つのセルが表示される", () => {
      const inputs: Record<string, string> = {};
      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(9);
    });

    it("中央セクション（1,1）の中央セルにテーマが表示される", () => {
      const inputs: Record<string, string> = {};
      render(
        <MandalartSection
          sectionRowIndex={1}
          sectionColumnIndex={1}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="メインテーマ"
        />
      );

      expect(screen.getByDisplayValue("メインテーマ")).toBeInTheDocument();
    });

    it("非中央セクションの中央セルには中央セクションの対応位置の値が表示される", () => {
      const inputs: Record<string, string> = {
        "1-1-0-0": "サブテーマ1", // 中央セクション（1,1）の(0,0)位置の値
      };

      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      // セクション(0,0)の中央セルには、中央セクション(1,1)の(0,0)位置の値が表示される
      expect(screen.getByDisplayValue("サブテーマ1")).toBeInTheDocument();
    });

    it("inputsに保存されている値がセルに表示される", () => {
      const inputs: Record<string, string> = {
        "0-0-0-0": "アイデア1",
        "0-0-2-2": "アイデア2",
      };

      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア2")).toBeInTheDocument();
    });
  });

  describe("readOnly", () => {
    it("readOnly=trueの場合、すべてのセルが読み取り専用になる", () => {
      const inputs: Record<string, string> = {};
      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
          readOnly={true}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });

    it("中央セルは常に読み取り専用である", () => {
      const inputs: Record<string, string> = {
        "1-1-0-0": "サブテーマ",
      };

      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
          readOnly={false}
        />
      );

      // 中央セル（サブテーマが表示されているセル）は読み取り専用
      const centerCell = screen.getByDisplayValue("サブテーマ");
      expect(centerCell).toHaveAttribute("readonly");
    });

    it("中央セクションの中央セル（テーマセル）は読み取り専用", () => {
      const inputs: Record<string, string> = {};

      render(
        <MandalartSection
          sectionRowIndex={1}
          sectionColumnIndex={1}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="メインテーマ"
          readOnly={false}
        />
      );

      const themeCell = screen.getByDisplayValue("メインテーマ");
      expect(themeCell).toHaveAttribute("readonly");
    });
  });

  describe("onCellChange", () => {
    it("セルの値が変更されるとonCellChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      const inputs: Record<string, string> = {};

      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      // 最初のセル（非中央セル）に入力
      const textareas = screen.getAllByRole("textbox");
      const firstEditableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (firstEditableTextarea) {
        await user.type(firstEditableTextarea, "新しい値");
        await user.tab(); // blur

        expect(mockOnCellChange).toHaveBeenCalled();
      }
    });

    it("onCellChangeに正しい引数が渡される", async () => {
      const user = userEvent.setup();
      const inputs: Record<string, string> = {};

      render(
        <MandalartSection
          sectionRowIndex={2}
          sectionColumnIndex={1}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      // 編集可能なセルを探して入力
      const textareas = screen.getAllByRole("textbox");
      const editableTextarea = textareas.find(
        textarea => !textarea.hasAttribute("readonly")
      );

      if (editableTextarea) {
        await user.type(editableTextarea, "テスト");
        await user.tab();

        // sectionRowIndex=2, sectionColumnIndex=1 が渡されていることを確認
        expect(mockOnCellChange).toHaveBeenCalledWith(
          2, // sectionRowIndex
          1, // sectionColumnIndex
          expect.any(Number), // rowIndex
          expect.any(Number), // columnIndex
          "テスト"
        );
      }
    });
  });

  describe("セクション位置による動作", () => {
    it("セクション(0,0)の中央セルには1-1-0-0のキーの値が表示される", () => {
      const inputs: Record<string, string> = {
        "1-1-0-0": "左上のサブテーマ",
      };

      render(
        <MandalartSection
          sectionRowIndex={0}
          sectionColumnIndex={0}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      expect(screen.getByDisplayValue("左上のサブテーマ")).toBeInTheDocument();
    });

    it("セクション(2,2)の中央セルには1-1-2-2のキーの値が表示される", () => {
      const inputs: Record<string, string> = {
        "1-1-2-2": "右下のサブテーマ",
      };

      render(
        <MandalartSection
          sectionRowIndex={2}
          sectionColumnIndex={2}
          inputs={inputs}
          onCellChange={mockOnCellChange}
          mandalartTheme="テーマ"
        />
      );

      expect(screen.getByDisplayValue("右下のサブテーマ")).toBeInTheDocument();
    });
  });
});
