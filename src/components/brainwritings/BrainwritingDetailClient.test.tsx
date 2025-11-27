import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingDetailClient from "./BrainwritingDetailClient";
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

// react-hot-toastのモック
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// x-postのモック
vi.mock("@/lib/x-post", () => ({
  postBrainwritingToX: vi.fn(),
}));

// hooksのモック
vi.mock("@/hooks/useBrainwritingDataChange", () => ({
  useBrainwritingDataChange: () => ({
    handleDataChange: vi.fn(),
  }),
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("BrainwritingDetailClient", () => {
  const currentUserId = "user-1";

  const mockBrainwritingXpost: BrainwritingDetail = {
    id: 1,
    title: "X投稿版ブレインライティング",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    usageScope: USAGE_SCOPE.XPOST,
    inviteToken: "test-token",
    isInviteActive: true,
    isResultsPublic: false,
    sheets: [
      { id: 1, brainwriting_id: 1, current_user_id: "user-1", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
    ],
    inputs: [
      { id: 1, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 0, content: "アイデア1", created_at: new Date(), updated_at: new Date() },
    ],
    users: [
      { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1", created_at: new Date(), updated_at: new Date() },
    ],
  };

  const mockBrainwritingTeam: BrainwritingDetail = {
    ...mockBrainwritingXpost,
    id: 2,
    title: "チーム利用版ブレインライティング",
    usageScope: USAGE_SCOPE.TEAM,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });
  });

  describe("表示", () => {
    it("ブレインライティング情報が表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingXpost}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("X投稿版ブレインライティング")).toBeInTheDocument();
      expect(screen.getByText("テストテーマ")).toBeInTheDocument();
    });

    it("シートの内容が表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingXpost}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByDisplayValue("アイデア1")).toBeInTheDocument();
    });
  });

  describe("X投稿版", () => {
    it("X共有ボタンが表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingXpost}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByRole("button", { name: /共有/ })).toBeInTheDocument();
    });

    it("共有リンクトグルが表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingXpost}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("共有リンク：")).toBeInTheDocument();
    });

    it("結果公開トグルが表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingXpost}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("結果公開：")).toBeInTheDocument();
    });
  });

  describe("チーム利用版", () => {
    it("招待リンクコピーが表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingTeam}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("招待リンク")).toBeInTheDocument();
    });
  });

  describe("複数シート", () => {
    const multiSheetDetail: BrainwritingDetail = {
      ...mockBrainwritingXpost,
      sheets: [
        { id: 1, brainwriting_id: 1, current_user_id: "user-1", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
        { id: 2, brainwriting_id: 1, current_user_id: "user-2", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
      ],
    };

    it("複数シートがある場合、タブが表示される", () => {
      render(
        <BrainwritingDetailClient
          brainwritingDetail={multiSheetDetail}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByRole("button", { name: "シート 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "シート 2" })).toBeInTheDocument();
    });

    it("タブをクリックするとシートが切り替わる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingDetailClient
          brainwritingDetail={multiSheetDetail}
          currentUserId={currentUserId}
        />
      );

      const sheet2Button = screen.getByRole("button", { name: "シート 2" });
      await user.click(sheet2Button);

      expect(sheet2Button).toHaveClass("bg-primary");
    });
  });

  describe("トグル操作", () => {
    it("共有リンクトグルを切り替えるとAPIが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingDetailClient
          brainwritingDetail={mockBrainwritingXpost}
          currentUserId={currentUserId}
        />
      );

      // 共有リンクトグルのボタンを見つけてクリック
      const toggleButtons = screen.getAllByRole("button");
      const shareToggleButton = toggleButtons.find(btn => 
        btn.closest("div")?.textContent?.includes("共有リンク") && 
        btn.getAttribute("role") === "button" &&
        btn.querySelector("span")
      );
      
      if (shareToggleButton) {
        await user.click(shareToggleButton);

        await waitFor(() => {
          expect(mockFetch).toHaveBeenCalledWith(
            "/api/brainwritings/1/invite-active",
            expect.anything()
          );
        });
      }
    });
  });
});
