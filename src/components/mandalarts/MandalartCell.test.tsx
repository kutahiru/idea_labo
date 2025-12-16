import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MandalartCell from "./MandalartCell";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("MandalartCell", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("初期値が表示される", () => {
      render(<MandalartCell value="テスト値" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("テスト値")).toBeInTheDocument();
    });

    it("valueがundefinedの場合、空のテキストエリアが表示される", () => {
      render(<MandalartCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("readOnlyがtrueの場合、テキストエリアが読み取り専用になる", () => {
      render(<MandalartCell value="テスト" onChange={mockOnChange} readOnly={true} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readonly");
    });

    it("通常セルのスタイルが適用される", () => {
      const { container } = render(<MandalartCell value="テスト" onChange={mockOnChange} />);

      const cell = container.querySelector(".border-primary\\/50");
      expect(cell).toBeInTheDocument();
    });

    it("メインテーマセル（isCenter=true, isSectionCenter=true）のスタイルが適用される", () => {
      const { container } = render(
        <MandalartCell value="テーマ" onChange={mockOnChange} isCenter={true} isSectionCenter={true} />
      );

      const cell = container.querySelector(".border-accent");
      expect(cell).toBeInTheDocument();
    });

    it("セクション中央セル（isCenter=true, isSectionCenter=false）のスタイルが適用される", () => {
      const { container } = render(
        <MandalartCell value="サブテーマ" onChange={mockOnChange} isCenter={true} isSectionCenter={false} />
      );

      const cell = container.querySelector(".border-primary");
      expect(cell).toBeInTheDocument();
    });

    it("中央セクションの周囲セル（isCenter=false, isSectionCenter=true）のスタイルが適用される", () => {
      const { container } = render(
        <MandalartCell value="周囲" onChange={mockOnChange} isCenter={false} isSectionCenter={true} />
      );

      const cell = container.querySelector(".border-primary");
      expect(cell).toBeInTheDocument();
    });
  });

  describe("入力", () => {
    it("テキストを入力できる", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しい値");

      expect(screen.getByDisplayValue("新しい値")).toBeInTheDocument();
    });

    it("readOnlyの場合、入力できない", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="初期値" onChange={mockOnChange} readOnly={true} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "追加テキスト");

      expect(screen.getByDisplayValue("初期値")).toBeInTheDocument();
      expect(screen.queryByDisplayValue("初期値追加テキスト")).not.toBeInTheDocument();
    });
  });

  describe("onChange", () => {
    it("blur時に値が変更されていればonChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しい値");
      await user.tab(); // blur

      expect(mockOnChange).toHaveBeenCalledWith("新しい値");
    });

    it("blur時に値が変更されていなければonChangeは呼ばれない", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="初期値" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.tab(); // blur

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("Enterキーで値が保存され、onChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しい値");
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("新しい値");
      });
    });
  });

  describe("フォントサイズの動的変更", () => {
    it("短いテキストはtext-smが適用される", () => {
      render(<MandalartCell value="短い" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("text-sm");
    });

    it("19-24文字のテキストはtext-xsが適用される", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      const text = "あ".repeat(20); // 20文字
      await user.type(textarea, text);

      expect(textarea).toHaveClass("text-xs");
    });

    it("25-40文字のテキストはtext-[10px]が適用される", async () => {
      const user = userEvent.setup();
      render(<MandalartCell value="" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      const text = "あ".repeat(30); // 30文字
      await user.type(textarea, text);

      expect(textarea).toHaveClass("text-[10px]");
    });
  });

  describe("最大文字数", () => {
    it("maxLengthが30に設定されている", () => {
      render(<MandalartCell value="" onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "30");
    });
  });

  describe("propsの変更", () => {
    it("valueが変更されるとlocalValueが更新される", () => {
      const { rerender } = render(<MandalartCell value="初期値" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("初期値")).toBeInTheDocument();

      rerender(<MandalartCell value="更新値" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("更新値")).toBeInTheDocument();
    });
  });
});
