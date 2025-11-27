import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistCell from "./OsbornChecklistCell";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("OsbornChecklistCell", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    title: "転用",
    description: "他の用途に転用できないか？",
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("タイトルが表示される", () => {
      render(<OsbornChecklistCell {...defaultProps} />);

      expect(screen.getByText("転用")).toBeInTheDocument();
    });

    it("初期値が表示される", () => {
      render(<OsbornChecklistCell {...defaultProps} value="テスト入力" />);

      expect(screen.getByDisplayValue("テスト入力")).toBeInTheDocument();
    });

    it("valueがundefinedの場合、空のテキストエリアが表示される", () => {
      render(<OsbornChecklistCell {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
    });

    it("プレースホルダーが表示される", () => {
      render(<OsbornChecklistCell {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("placeholder", "転用できないか？");
    });

    it("readOnlyの場合、プレースホルダーは空になる", () => {
      render(<OsbornChecklistCell {...defaultProps} readOnly={true} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("placeholder", "");
    });

    it("readOnlyがtrueの場合、テキストエリアが読み取り専用になる", () => {
      render(<OsbornChecklistCell {...defaultProps} readOnly={true} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("readonly");
    });

    it("ヘルプアイコンが表示される", () => {
      render(<OsbornChecklistCell {...defaultProps} />);

      // HelpCircleアイコンのSVGが存在することを確認（lucide-reactのクラス名）
      const helpIcon = document.querySelector("svg");
      expect(helpIcon).toBeInTheDocument();
    });
  });

  describe("入力", () => {
    it("テキストを入力できる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistCell {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しいアイデア");

      expect(textarea).toHaveValue("新しいアイデア");
    });

    it("readOnlyの場合、入力できない", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistCell {...defaultProps} readOnly={true} value="元の値" />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しい値");

      expect(textarea).toHaveValue("元の値");
    });
  });

  describe("onChange", () => {
    it("blur時に値が変更されていればonChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistCell {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しいアイデア");
      await user.tab();

      expect(mockOnChange).toHaveBeenCalledWith("新しいアイデア");
    });

    it("blur時に値が変更されていなければonChangeは呼ばれない", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistCell {...defaultProps} value="元の値" />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.tab();

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("Ctrl+Enterで値が保存される", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistCell {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "新しいアイデア");
      await user.keyboard("{Control>}{Enter}{/Control}");

      expect(mockOnChange).toHaveBeenCalledWith("新しいアイデア");
    });
  });

  describe("最大文字数", () => {
    it("maxLengthが500に設定されている", () => {
      render(<OsbornChecklistCell {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "500");
    });
  });

  describe("propsの変更", () => {
    it("valueが変更されるとlocalValueが更新される", async () => {
      const { rerender } = render(<OsbornChecklistCell {...defaultProps} value="初期値" />);

      expect(screen.getByDisplayValue("初期値")).toBeInTheDocument();

      rerender(<OsbornChecklistCell {...defaultProps} value="更新された値" />);

      expect(screen.getByDisplayValue("更新された値")).toBeInTheDocument();
    });
  });
});
