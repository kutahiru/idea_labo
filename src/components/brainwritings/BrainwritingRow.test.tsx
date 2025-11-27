import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingRow from "./BrainwritingRow";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BrainwritingRow", () => {
  const mockOnIdeaChange = vi.fn();
  const defaultProps = {
    userName: "テストユーザー",
    ideas: ["アイデア1", "アイデア2", "アイデア3"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("ユーザー名が表示される", () => {
      render(<BrainwritingRow {...defaultProps} />);

      expect(screen.getByText("テストユーザー")).toBeInTheDocument();
    });

    it("3つのアイデアセルが表示される", () => {
      render(<BrainwritingRow {...defaultProps} />);

      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア3")).toBeInTheDocument();
    });

    it("4つのセル（ユーザーセル + 3つのアイデアセル）が表示される", () => {
      render(<BrainwritingRow {...defaultProps} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(3);
    });
  });

  describe("readOnly", () => {
    it("readOnly=falseの場合、編集可能", () => {
      render(<BrainwritingRow {...defaultProps} readOnly={false} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).not.toHaveAttribute("readonly");
      });
    });

    it("readOnly=trueの場合、すべてのセルが読み取り専用になる", () => {
      render(<BrainwritingRow {...defaultProps} readOnly={true} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });
  });

  describe("ハイライト", () => {
    it("isHighlighted=trueの場合、ハイライトスタイルが適用される", () => {
      render(<BrainwritingRow {...defaultProps} isHighlighted={true} />);

      const highlightedCells = document.querySelectorAll(".border-accent");
      expect(highlightedCells.length).toBe(3); // 3つのアイデアセルすべてがハイライト
    });

    it("isHighlighted=falseの場合、通常スタイル", () => {
      render(<BrainwritingRow {...defaultProps} isHighlighted={false} />);

      const normalCells = document.querySelectorAll(".border-primary\\/50");
      expect(normalCells.length).toBe(4); // ユーザーセル + 3つのアイデアセル
    });
  });

  describe("onIdeaChange", () => {
    it("アイデアを変更するとonIdeaChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingRow {...defaultProps} onIdeaChange={mockOnIdeaChange} />);

      const textareas = screen.getAllByRole("textbox");
      await user.clear(textareas[0]);
      await user.type(textareas[0], "新しいアイデア");
      await user.tab();

      await waitFor(() => {
        expect(mockOnIdeaChange).toHaveBeenCalledWith(0, "新しいアイデア");
      });
    });

    it("各列のインデックスが正しく渡される", async () => {
      const user = userEvent.setup();
      render(<BrainwritingRow {...defaultProps} onIdeaChange={mockOnIdeaChange} />);

      const textareas = screen.getAllByRole("textbox");
      
      // 2番目のセル（インデックス1）を編集
      await user.clear(textareas[1]);
      await user.type(textareas[1], "2番目のアイデア");
      await user.tab();

      await waitFor(() => {
        expect(mockOnIdeaChange).toHaveBeenCalledWith(1, "2番目のアイデア");
      });
    });
  });

  describe("空データ", () => {
    it("アイデアが空配列でも3つのセルが表示される", () => {
      render(<BrainwritingRow userName="ユーザー" ideas={[]} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(3);
    });
  });
});
