import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import OsbornChecklistPublicClient from "./OsbornChecklistPublicClient";
import { OsbornChecklistDetail } from "@/types/osborn-checklist";
import { OSBORN_CHECKLIST_NAMES } from "@/schemas/osborn-checklist";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("OsbornChecklistPublicClient", () => {
  const mockOsbornChecklistDetail: OsbornChecklistDetail = {
    id: 1,
    title: "公開チェックリスト",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    publicToken: "public-token-123",
    isResultsPublic: true,
    inputs: [
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
    ],
    aiGeneration: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("チェックリストのタイトルが表示される", () => {
      render(<OsbornChecklistPublicClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByText("公開チェックリスト")).toBeInTheDocument();
    });

    it("説明が表示される", () => {
      render(<OsbornChecklistPublicClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByText("テスト説明")).toBeInTheDocument();
    });

    it("入力データがグリッドに表示される", () => {
      render(<OsbornChecklistPublicClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      expect(screen.getByDisplayValue("転用アイデア")).toBeInTheDocument();
      expect(screen.getByDisplayValue("応用アイデア")).toBeInTheDocument();
    });

    it("9つの視点すべてが表示される", () => {
      render(<OsbornChecklistPublicClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      Object.values(OSBORN_CHECKLIST_NAMES).forEach(name => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    });

    it("9つのセルが表示される", () => {
      render(<OsbornChecklistPublicClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(9);
    });
  });

  describe("読み取り専用", () => {
    it("すべてのセルが読み取り専用になっている", () => {
      render(<OsbornChecklistPublicClient osbornChecklistDetail={mockOsbornChecklistDetail} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });
  });

  describe("空データ", () => {
    it("入力がない場合でもグリッドが表示される", () => {
      const emptyChecklist: OsbornChecklistDetail = {
        ...mockOsbornChecklistDetail,
        inputs: [],
      };

      render(<OsbornChecklistPublicClient osbornChecklistDetail={emptyChecklist} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(9);
    });

    it("説明がnullの場合でもエラーなく表示される", () => {
      const noDescriptionChecklist: OsbornChecklistDetail = {
        ...mockOsbornChecklistDetail,
        description: null,
      };

      render(<OsbornChecklistPublicClient osbornChecklistDetail={noDescriptionChecklist} />);

      expect(screen.getByText("公開チェックリスト")).toBeInTheDocument();
    });
  });
});
