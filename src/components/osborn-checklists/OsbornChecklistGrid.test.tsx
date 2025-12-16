import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OsbornChecklistGrid from "./OsbornChecklistGrid";
import { OsbornChecklistInputData } from "@/types/osborn-checklist";
import { OSBORN_CHECKLIST_NAMES } from "@/schemas/osborn-checklist";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("OsbornChecklistGrid", () => {
  const mockOnInputChange = vi.fn();
  const mockInputs: OsbornChecklistInputData[] = [
    {
      id: 1,
      osborn_checklist_id: 1,
      checklist_type: "transfer",
      content: "転用アイデア",
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      osborn_checklist_id: 1,
      checklist_type: "apply",
      content: "応用アイデア",
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const defaultProps = {
    osbornChecklistId: 1,
    inputs: mockInputs,
    onInputChange: mockOnInputChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("9つの視点がすべて表示される", () => {
      render(<OsbornChecklistGrid {...defaultProps} />);

      Object.values(OSBORN_CHECKLIST_NAMES).forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });

    it("9つのテキストエリアが表示される", () => {
      render(<OsbornChecklistGrid {...defaultProps} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(9);
    });

    it("inputsの内容がセルに表示される", () => {
      render(<OsbornChecklistGrid {...defaultProps} />);

      expect(screen.getByDisplayValue("転用アイデア")).toBeInTheDocument();
      expect(screen.getByDisplayValue("応用アイデア")).toBeInTheDocument();
    });

    it("contentがnullの入力は空として扱われる", () => {
      const inputsWithNull: OsbornChecklistInputData[] = [
        {
          id: 1,
          osborn_checklist_id: 1,
          checklist_type: "transfer",
          content: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      render(<OsbornChecklistGrid {...defaultProps} inputs={inputsWithNull} />);

      // 転用のセルが空であることを確認
      const textareas = screen.getAllByRole("textbox");
      const transferTextarea = textareas[0];
      expect(transferTextarea).toHaveValue("");
    });
  });

  describe("readOnly", () => {
    it("readOnly=falseの場合、編集可能", () => {
      render(<OsbornChecklistGrid {...defaultProps} readOnly={false} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).not.toHaveAttribute("readonly");
      });
    });

    it("readOnly=trueの場合、すべてのセルが読み取り専用になる", () => {
      render(<OsbornChecklistGrid {...defaultProps} readOnly={true} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });
  });

  describe("onInputChange", () => {
    it("セルの値が変更されるとonInputChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistGrid {...defaultProps} />);

      const textareas = screen.getAllByRole("textbox");
      const transferTextarea = textareas[0]; // 転用

      await user.clear(transferTextarea);
      await user.type(transferTextarea, "新しい転用アイデア");
      await user.tab();

      await waitFor(() => {
        expect(mockOnInputChange).toHaveBeenCalledWith("transfer", "新しい転用アイデア");
      });
    });

    it("onInputChangeに正しいchecklistTypeが渡される", async () => {
      const user = userEvent.setup();
      render(<OsbornChecklistGrid {...defaultProps} />);

      const textareas = screen.getAllByRole("textbox");

      // 変更（3番目のセル）
      const modifyTextarea = textareas[2];
      await user.type(modifyTextarea, "変更アイデア");
      await user.tab();

      await waitFor(() => {
        expect(mockOnInputChange).toHaveBeenCalledWith("modify", "変更アイデア");
      });
    });
  });

  describe("空データ", () => {
    it("inputsが空でも9つのセルが表示される", () => {
      render(<OsbornChecklistGrid {...defaultProps} inputs={[]} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(9);
    });
  });
});
