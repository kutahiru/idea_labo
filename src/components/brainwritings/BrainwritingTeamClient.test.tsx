import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingTeamClient from "./BrainwritingTeamClient";
import { BrainwritingDetail } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import toast from "react-hot-toast";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// react-hot-toastのモック
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// hooksのモック
vi.mock("@/hooks/useBrainwritingRealtime", () => ({
  useBrainwritingRealtime: ({ initialUsers, initialSheets, initialInputs }: { 
    initialUsers: unknown[], 
    initialSheets: unknown[], 
    initialInputs: unknown[] 
  }) => ({
    users: initialUsers,
    sheets: initialSheets,
    inputs: initialInputs,
  }),
}));

vi.mock("@/hooks/useAutoRefreshOnFocus", () => ({
  useAutoRefreshOnFocus: vi.fn(),
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("BrainwritingTeamClient", () => {
  const currentUserId = "user-1";

  const mockBrainwritingTeam: BrainwritingDetail = {
    id: 1,
    title: "チーム利用版ブレインライティング",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    usageScope: USAGE_SCOPE.TEAM,
    inviteToken: "test-token",
    isInviteActive: true,
    sheets: [],
    inputs: [],
    users: [
      { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1", created_at: new Date(), updated_at: new Date() },
      { id: 2, brainwriting_id: 1, user_id: "user-2", user_name: "ユーザー2", created_at: new Date(), updated_at: new Date() },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  describe("開始前（sheets.length === 0）", () => {
    it("参加者一覧が表示される", () => {
      render(
        <BrainwritingTeamClient
          brainwritingTeam={mockBrainwritingTeam}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("参加者一覧")).toBeInTheDocument();
      expect(screen.getByText("ユーザー1")).toBeInTheDocument();
      expect(screen.getByText("ユーザー2")).toBeInTheDocument();
    });

    it("作成者の場合、開始ボタンが表示される", () => {
      render(
        <BrainwritingTeamClient
          brainwritingTeam={mockBrainwritingTeam}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
    });

    it("作成者でない場合、待機メッセージが表示される", () => {
      render(
        <BrainwritingTeamClient
          brainwritingTeam={mockBrainwritingTeam}
          currentUserId="user-2"
        />
      );

      expect(screen.getByText("作成者が開始するまでお待ちください")).toBeInTheDocument();
    });

    it("参加者が2人未満の場合、開始ボタンクリックでエラートーストが表示される", async () => {
      const singleUserTeam: BrainwritingDetail = {
        ...mockBrainwritingTeam,
        users: [
          { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1", created_at: new Date(), updated_at: new Date() },
        ],
      };

      const user = userEvent.setup();
      render(
        <BrainwritingTeamClient
          brainwritingTeam={singleUserTeam}
          currentUserId={currentUserId}
        />
      );

      await user.click(screen.getByRole("button", { name: "開始" }));

      expect(toast.error).toHaveBeenCalledWith("最低でも参加者が2人必要です。");
    });

    it("参加者が6人未満の場合、確認モーダルが表示される", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingTeamClient
          brainwritingTeam={mockBrainwritingTeam}
          currentUserId={currentUserId}
        />
      );

      await user.click(screen.getByRole("button", { name: "開始" }));

      expect(screen.getByText("参加者が6人未満です")).toBeInTheDocument();
    });
  });

  describe("開始後（sheets.length > 0）", () => {
    const startedBrainwriting: BrainwritingDetail = {
      ...mockBrainwritingTeam,
      sheets: [
        { id: 1, brainwriting_id: 1, current_user_id: "user-1", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
        { id: 2, brainwriting_id: 1, current_user_id: "user-2", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
      ],
    };

    it("シート一覧が表示される", () => {
      render(
        <BrainwritingTeamClient
          brainwritingTeam={startedBrainwriting}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("シート一覧")).toBeInTheDocument();
    });
  });
});
