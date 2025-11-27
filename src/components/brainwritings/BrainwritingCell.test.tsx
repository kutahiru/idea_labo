import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingCell from "./BrainwritingCell";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BrainwritingCell", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("初期値が表示される", () => {
      render(<BrainwritingCell value="テストアイデア" onChange={mockOnChange} />);

      expect(screen.getByDisplayValue("テストアイデア")).toBeInTheDocument();
    });

    it("valueがundefinedの場合、空のテキストエリアが表示される", () => {
      render(<BrainwritingCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("プレースホルダーが表示される", () => {
      render(<BrainwritingCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("placeholder", "アイデアを入力");
    });

    it("readOnlyの場合、プレースホルダーは空になる", () => {
      render(<BrainwritingCell onChange={mockOnChange} readOnly={true} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("placeholder", "");
    });

    it("readOnlyがtrueの場合、テキストエリアが読み取り専用になる", () => {
      render(<BrainwritingCell onChange={mockOnChange} readOnly={true} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readonly");
    });

    it("readOnlyの場合、ロックアイコンが表示される", () => {
      render(<BrainwritingCell onChange={mockOnChange} readOnly={true} />);

      // Lockアイコンのsvgを確認
      const lockIcon = document.querySelector("svg");
      expect(lockIcon).toBeInTheDocument();
    });

    it("ハイライト時はスタイルが変わる", () => {
      render(<BrainwritingCell onChange={mockOnChange} isHighlighted={true} />);

      const cell = document.querySelector(".border-accent");
      expect(cell).toBeInTheDocument();
    });

    it("非ハイライト時は通常スタイル", () => {
      render(<BrainwritingCell onChange={mockOnChange} isHighlighted={false} />);

      const cell = document.querySelector(".border-primary\\/50");
      expect(cell).toBeInTheDocument();
    });
  });

  describe("入力", () => {
    it("テキストを入力できる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しいアイデア");

      expect(textarea).toHaveValue("新しいアイデア");
    });

    it("readOnlyの場合、入力できない", async () => {
      const user = userEvent.setup();
      render(<BrainwritingCell onChange={mockOnChange} readOnly={true} value="元の値" />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しい値");

      expect(textarea).toHaveValue("元の値");
    });
  });

  describe("onChange", () => {
    it("blur時に値が変更されていればonChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しいアイデア");
      await user.tab();

      expect(mockOnChange).toHaveBeenCalledWith("新しいアイデア");
    });

    it("blur時に値が変更されていなければonChangeは呼ばれない", async () => {
      const user = userEvent.setup();
      render(<BrainwritingCell onChange={mockOnChange} value="元の値" />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.tab();

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("Enterキーで値が保存される", async () => {
      const user = userEvent.setup();
      render(<BrainwritingCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しいアイデア");
      await user.keyboard("{Enter}");

      expect(mockOnChange).toHaveBeenCalledWith("新しいアイデア");
    });
  });

  describe("最大文字数", () => {
    it("maxLengthが50に設定されている", () => {
      render(<BrainwritingCell onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "50");
    });
  });

  describe("propsの変更", () => {
    it("valueが変更されるとlocalValueが更新される", async () => {
      const { rerender } = render(<BrainwritingCell onChange={mockOnChange} value="初期値" />);

      expect(screen.getByDisplayValue("初期値")).toBeInTheDocument();

      rerender(<BrainwritingCell onChange={mockOnChange} value="更新された値" />);

      expect(screen.getByDisplayValue("更新された値")).toBeInTheDocument();
    });
  });
});
