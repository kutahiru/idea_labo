import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingResultsClient from "./BrainwritingResultsClient";
import { BrainwritingDetail } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BrainwritingResultsClient", () => {
  const mockBrainwritingDetail: BrainwritingDetail = {
    id: 1,
    title: "テストブレインライティング",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    usageScope: USAGE_SCOPE.XPOST,
    sheets: [
      { id: 1, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
    ],
    inputs: [
      { id: 1, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 0, content: "アイデア1-1", created_at: new Date(), updated_at: new Date() },
      { id: 2, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 1, content: "アイデア1-2", created_at: new Date(), updated_at: new Date() },
      { id: 3, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 2, content: "アイデア1-3", created_at: new Date(), updated_at: new Date() },
    ],
    users: [
      { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1", created_at: new Date(), updated_at: new Date() },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("ブレインライティング情報が表示される", () => {
      render(<BrainwritingResultsClient brainwritingDetail={mockBrainwritingDetail} />);

      expect(screen.getByText("テストブレインライティング")).toBeInTheDocument();
      expect(screen.getByText("テストテーマ")).toBeInTheDocument();
    });

    it("シートの内容が表示される", () => {
      render(<BrainwritingResultsClient brainwritingDetail={mockBrainwritingDetail} />);

      expect(screen.getByDisplayValue("アイデア1-1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア1-2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア1-3")).toBeInTheDocument();
    });

    it("閲覧専用モードで表示される", () => {
      render(<BrainwritingResultsClient brainwritingDetail={mockBrainwritingDetail} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });
  });

  describe("複数シート", () => {
    const multiSheetDetail: BrainwritingDetail = {
      ...mockBrainwritingDetail,
      sheets: [
        { id: 1, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
        { id: 2, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
        { id: 3, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
      ],
    };

    it("複数シートがある場合、タブが表示される", () => {
      render(<BrainwritingResultsClient brainwritingDetail={multiSheetDetail} />);

      expect(screen.getByRole("button", { name: "シート 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "シート 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "シート 3" })).toBeInTheDocument();
    });

    it("タブをクリックするとシートが切り替わる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingResultsClient brainwritingDetail={multiSheetDetail} />);

      // 初期状態ではシート1がアクティブ
      const sheet1Button = screen.getByRole("button", { name: "シート 1" });
      expect(sheet1Button).toHaveClass("bg-primary");

      // シート2をクリック
      const sheet2Button = screen.getByRole("button", { name: "シート 2" });
      await user.click(sheet2Button);

      expect(sheet2Button).toHaveClass("bg-primary");
      expect(sheet1Button).not.toHaveClass("bg-primary");
    });
  });

  describe("単一シート", () => {
    it("単一シートの場合、タブは表示されない", () => {
      render(<BrainwritingResultsClient brainwritingDetail={mockBrainwritingDetail} />);

      expect(screen.queryByRole("button", { name: "シート 1" })).not.toBeInTheDocument();
    });
  });
});
