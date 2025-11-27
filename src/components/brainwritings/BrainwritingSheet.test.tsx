import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingSheet from "./BrainwritingSheet";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BrainwritingSheet", () => {
  const mockOnDataChange = vi.fn();
  const mockBrainwritingRows = [
    { name: "ユーザー1", ideas: ["アイデア1-1", "アイデア1-2", "アイデア1-3"] },
    { name: "ユーザー2", ideas: ["アイデア2-1", "アイデア2-2", "アイデア2-3"] },
    { name: "ユーザー3", ideas: ["アイデア3-1", "アイデア3-2", "アイデア3-3"] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("表示", () => {
    it("ヘッダー行が表示される", () => {
      render(<BrainwritingSheet brainwritingRows={mockBrainwritingRows} />);

      expect(screen.getByText("参加者")).toBeInTheDocument();
      expect(screen.getByText("アイデア1")).toBeInTheDocument();
      expect(screen.getByText("アイデア2")).toBeInTheDocument();
      expect(screen.getByText("アイデア3")).toBeInTheDocument();
    });

    it("ユーザー名が表示される", () => {
      render(<BrainwritingSheet brainwritingRows={mockBrainwritingRows} />);

      expect(screen.getByText("ユーザー1")).toBeInTheDocument();
      expect(screen.getByText("ユーザー2")).toBeInTheDocument();
      expect(screen.getByText("ユーザー3")).toBeInTheDocument();
    });

    it("アイデアがセルに表示される", () => {
      render(<BrainwritingSheet brainwritingRows={mockBrainwritingRows} />);

      expect(screen.getByDisplayValue("アイデア1-1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア2-2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア3-3")).toBeInTheDocument();
    });

    it("9つのアイデアセル（3行×3列）が表示される", () => {
      render(<BrainwritingSheet brainwritingRows={mockBrainwritingRows} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(9);
    });
  });

  describe("readOnly", () => {
    it("isAllReadOnly=trueの場合、すべてのセルが読み取り専用", () => {
      render(<BrainwritingSheet brainwritingRows={mockBrainwritingRows} isAllReadOnly={true} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });

    it("isAllReadOnly=falseの場合、編集可能なセルがある", () => {
      render(<BrainwritingSheet brainwritingRows={mockBrainwritingRows} isAllReadOnly={false} />);

      const textareas = screen.getAllByRole("textbox");
      const editableTextareas = textareas.filter(
        textarea => !textarea.hasAttribute("readonly")
      );
      expect(editableTextareas.length).toBeGreaterThan(0);
    });
  });

  describe("activeRowIndex", () => {
    it("activeRowIndexで指定した行のみ編集可能", () => {
      render(
        <BrainwritingSheet
          brainwritingRows={mockBrainwritingRows}
          activeRowIndex={1}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      
      // 1行目（インデックス0）は読み取り専用
      expect(textareas[0]).toHaveAttribute("readonly");
      expect(textareas[1]).toHaveAttribute("readonly");
      expect(textareas[2]).toHaveAttribute("readonly");
      
      // 2行目（インデックス1）は編集可能
      expect(textareas[3]).not.toHaveAttribute("readonly");
      expect(textareas[4]).not.toHaveAttribute("readonly");
      expect(textareas[5]).not.toHaveAttribute("readonly");
      
      // 3行目（インデックス2）は読み取り専用
      expect(textareas[6]).toHaveAttribute("readonly");
      expect(textareas[7]).toHaveAttribute("readonly");
      expect(textareas[8]).toHaveAttribute("readonly");
    });

    it("activeRowIndexの行がハイライトされる", () => {
      render(
        <BrainwritingSheet
          brainwritingRows={mockBrainwritingRows}
          activeRowIndex={0}
        />
      );

      const highlightedCells = document.querySelectorAll(".border-accent");
      expect(highlightedCells.length).toBe(3); // 1行の3つのセル
    });
  });

  describe("onDataChange", () => {
    it("セルを編集するとonDataChangeが呼ばれる", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(
        <BrainwritingSheet
          brainwritingRows={mockBrainwritingRows}
          onDataChange={mockOnDataChange}
          activeRowIndex={0}
        />
      );

      const textareas = screen.getAllByRole("textbox");
      await user.clear(textareas[0]);
      await user.type(textareas[0], "新しいアイデア");
      await user.tab();

      await waitFor(() => {
        expect(mockOnDataChange).toHaveBeenCalledWith(0, 0, "新しいアイデア");
      });
    });
  });

  describe("空データ", () => {
    it("brainwritingRowsが空でもエラーにならない", () => {
      render(<BrainwritingSheet brainwritingRows={[]} />);

      expect(screen.getByText("参加者")).toBeInTheDocument();
    });
  });
});
