import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MandalartPublicClient from "./MandalartPublicClient";
import { MandalartDetail } from "@/types/mandalart";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("MandalartPublicClient", () => {
  const mockMandalartDetail: MandalartDetail = {
    id: 1,
    title: "公開マンダラート",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    publicToken: "public-token-123",
    isResultsPublic: true,
    inputs: [
      {
        id: 1,
        mandalart_id: 1,
        section_row_index: 0,
        section_column_index: 0,
        row_index: 0,
        column_index: 0,
        content: "アイデア1",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        mandalart_id: 1,
        section_row_index: 1,
        section_column_index: 1,
        row_index: 0,
        column_index: 0,
        content: "中央セクションのアイデア",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("マンダラートのタイトルが表示される", () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByText("公開マンダラート")).toBeInTheDocument();
    });

    it("マンダラートのテーマ名が表示される", () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByDisplayValue("テストテーマ")).toBeInTheDocument();
    });

    it("説明が表示される", () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByText("テスト説明")).toBeInTheDocument();
    });

    it("入力データがグリッドに表示される", () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
    });

    it("81個のセルが表示される", () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(81);
    });
  });

  describe("読み取り専用", () => {
    it("すべてのセルが読み取り専用になっている", () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      const textareas = screen.getAllByRole("textbox");
      textareas.forEach(textarea => {
        expect(textarea).toHaveAttribute("readonly");
      });
    });

    it("セルに入力しても値が変わらない", async () => {
      render(<MandalartPublicClient mandalartDetail={mockMandalartDetail} />);

      const textarea = screen.getByDisplayValue("アイデア1");
      expect(textarea).toHaveAttribute("readonly");
    });
  });

  describe("空データ", () => {
    it("入力がない場合でもグリッドが表示される", () => {
      const emptyMandalart: MandalartDetail = {
        ...mockMandalartDetail,
        inputs: [],
      };

      render(<MandalartPublicClient mandalartDetail={emptyMandalart} />);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(81);
    });

    it("説明がnullの場合でもエラーなく表示される", () => {
      const noDescriptionMandalart: MandalartDetail = {
        ...mockMandalartDetail,
        description: null,
      };

      render(<MandalartPublicClient mandalartDetail={noDescriptionMandalart} />);

      expect(screen.getByText("公開マンダラート")).toBeInTheDocument();
    });
  });
});
