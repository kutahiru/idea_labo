import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingInputClient from "./BrainwritingInputClient";
import { BrainwritingDetail } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// next/navigationのモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// react-hot-toastのモック
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// hooksのモック
vi.mock("@/hooks/useAutoRefreshOnFocus", () => ({
  useAutoRefreshOnFocus: vi.fn(),
}));

vi.mock("@/hooks/useBrainwritingDataChange", () => ({
  useBrainwritingDataChange: () => ({
    handleDataChange: vi.fn(),
  }),
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("BrainwritingInputClient", () => {
  const currentUserId = "user-2";

  const mockBrainwritingDetail: BrainwritingDetail = {
    id: 1,
    title: "テストブレインライティング",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    usageScope: USAGE_SCOPE.XPOST,
    inviteToken: "test-token",
    isInviteActive: true,
    sheets: [
      { id: 1, brainwriting_id: 1, current_user_id: "user-2", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
    ],
    inputs: [
      { id: 1, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 0, content: "アイデア1-1", created_at: new Date(), updated_at: new Date() },
      { id: 2, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 1, content: "アイデア1-2", created_at: new Date(), updated_at: new Date() },
      { id: 3, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 2, content: "アイデア1-3", created_at: new Date(), updated_at: new Date() },
    ],
    users: [
      { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1", created_at: new Date(), updated_at: new Date() },
      { id: 2, brainwriting_id: 1, user_id: "user-2", user_name: "ユーザー2", created_at: new Date(), updated_at: new Date() },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([
        { row_index: 1, column_index: 0, content: "テスト" },
        { row_index: 1, column_index: 1, content: "テスト" },
        { row_index: 1, column_index: 2, content: "テスト" },
      ]),
      text: () => Promise.resolve(JSON.stringify([
        { row_index: 1, column_index: 0, content: "テスト" },
        { row_index: 1, column_index: 1, content: "テスト" },
        { row_index: 1, column_index: 2, content: "テスト" },
      ])),
    });
  });

  describe("表示", () => {
    it("ブレインライティング情報が表示される", () => {
      render(
        <BrainwritingInputClient
          brainwritingDetail={mockBrainwritingDetail}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      expect(screen.getByText("テストブレインライティング")).toBeInTheDocument();
      expect(screen.getByText("テストテーマ")).toBeInTheDocument();
    });

    it("シートの内容が表示される", () => {
      render(
        <BrainwritingInputClient
          brainwritingDetail={mockBrainwritingDetail}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      expect(screen.getByDisplayValue("アイデア1-1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア1-2")).toBeInTheDocument();
      expect(screen.getByDisplayValue("アイデア1-3")).toBeInTheDocument();
    });

    it("回答を完了するボタンが表示される", () => {
      render(
        <BrainwritingInputClient
          brainwritingDetail={mockBrainwritingDetail}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      expect(screen.getByRole("button", { name: "回答を完了する" })).toBeInTheDocument();
    });
  });

  describe("読み取り専用", () => {
    it("current_user_idが自身と一致しない場合は読み取り専用", () => {
      const readOnlyDetail: BrainwritingDetail = {
        ...mockBrainwritingDetail,
        sheets: [
          { id: 1, brainwriting_id: 1, current_user_id: "user-1", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
        ],
      };

      render(
        <BrainwritingInputClient
          brainwritingDetail={readOnlyDetail}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      expect(screen.getByRole("button", { name: "回答済" })).toBeInTheDocument();
    });
  });

  describe("チーム利用版", () => {
    const teamBrainwriting: BrainwritingDetail = {
      ...mockBrainwritingDetail,
      usageScope: USAGE_SCOPE.TEAM,
    };

    it("チーム利用版の場合、戻るボタンが表示される", () => {
      render(
        <BrainwritingInputClient
          brainwritingDetail={teamBrainwriting}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      expect(screen.getByRole("button", { name: "戻る" })).toBeInTheDocument();
    });

    it("戻るボタンをクリックするとチームページに遷移する", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingInputClient
          brainwritingDetail={teamBrainwriting}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      await user.click(screen.getByRole("button", { name: "戻る" }));

      expect(mockPush).toHaveBeenCalledWith("/brainwritings/1/team");
    });
  });

  describe("回答完了", () => {
    it("回答完了ボタンをクリックすると確認モーダルが開く", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingInputClient
          brainwritingDetail={mockBrainwritingDetail}
          currentUserId={currentUserId}
          initialSecondsLeft={null}
        />
      );

      await user.click(screen.getByRole("button", { name: "回答を完了する" }));

      await waitFor(() => {
        expect(screen.getByText("回答を完了しますか？")).toBeInTheDocument();
      });
    });
  });
});
