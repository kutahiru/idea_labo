import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingInviteClient from "./BrainwritingInviteClient";
import { BrainwritingListItem } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

// next/navigationのモック
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// next-authのモック
const mockUseSession = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockUseSession(),
}));

// hooksのモック
const mockStatus = vi.fn();
const mockHandleJoin = vi.fn();

vi.mock("@/hooks/useBrainwritingJoinStatus", () => ({
  useBrainwritingJoinStatus: () => ({ status: mockStatus() }),
}));

vi.mock("@/hooks/useBrainwritingJoin", () => ({
  useBrainwritingJoin: () => ({ handleJoin: mockHandleJoin }),
}));

describe("BrainwritingInviteClient", () => {
  const mockBrainwriting: BrainwritingListItem = {
    id: 1,
    title: "テストブレインライティング",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    usageScope: USAGE_SCOPE.XPOST,
    isResultsPublic: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-2", name: "ユーザー2" } },
      status: "authenticated",
    });
    mockStatus.mockReturnValue({
      canJoin: true,
      isLocked: false,
      isFull: false,
      currentCount: 1,
      maxCount: 6,
    });
  });

  describe("ローディング中", () => {
    it("セッション読み込み中は読み込み中が表示される", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "loading",
      });

      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
    });

    it("ログイン済みでステータス読み込み中は確認中が表示される", () => {
      mockStatus.mockReturnValue(null);

      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("参加状況を確認中...")).toBeInTheDocument();
    });
  });

  describe("表示", () => {
    it("招待メッセージが表示される", () => {
      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("ブレインライティングに招待されました")).toBeInTheDocument();
    });

    it("ブレインライティングの説明が表示される", () => {
      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("ブレインライティングとは？")).toBeInTheDocument();
    });

    it("参加可能な場合、参加ボタンが表示される", () => {
      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByRole("button", { name: "参加する" })).toBeInTheDocument();
    });

    it("現在の参加者数が表示される", () => {
      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("現在 1/6 人が参加中")).toBeInTheDocument();
    });
  });

  describe("参加不可状態", () => {
    it("canJoin=falseの場合、参加できませんと表示される", () => {
      mockStatus.mockReturnValue({
        canJoin: false,
        isLocked: false,
        isFull: false,
      });

      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      const notJoinTexts = screen.getAllByText("参加できません");
      expect(notJoinTexts.length).toBeGreaterThan(0);
      expect(screen.getByText("ブレインライティングは既に開始されています")).toBeInTheDocument();
    });

    it("満員の場合、満員メッセージが表示される", () => {
      mockStatus.mockReturnValue({
        canJoin: true,
        isLocked: false,
        isFull: true,
        currentCount: 6,
        maxCount: 6,
      });

      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("参加人数が上限に達しています")).toBeInTheDocument();
    });

    it("ロック中の場合、ロックメッセージが表示される", () => {
      mockStatus.mockReturnValue({
        canJoin: true,
        isLocked: true,
        isFull: false,
        lockExpiresAt: new Date(Date.now() + 60000).toISOString(),
      });

      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByText("他の方が編集中です")).toBeInTheDocument();
    });
  });

  describe("未ログイン", () => {
    it("未ログインの場合、ログインして参加するボタンが表示される", () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: "unauthenticated",
      });

      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      expect(screen.getByRole("button", { name: "ログインして参加する" })).toBeInTheDocument();
    });
  });

  describe("結果公開", () => {
    it("結果公開時は結果確認ボタンが表示される", () => {
      const publicBrainwriting = {
        ...mockBrainwriting,
        isResultsPublic: true,
      };

      render(<BrainwritingInviteClient brainwriting={publicBrainwriting} token="test-token" />);

      expect(screen.getByRole("button", { name: "結果を確認" })).toBeInTheDocument();
    });

    it("結果確認ボタンをクリックすると結果ページに遷移する", async () => {
      const user = userEvent.setup();
      const publicBrainwriting = {
        ...mockBrainwriting,
        isResultsPublic: true,
      };

      render(<BrainwritingInviteClient brainwriting={publicBrainwriting} token="test-token" />);

      await user.click(screen.getByRole("button", { name: "結果を確認" }));

      expect(mockPush).toHaveBeenCalledWith("/brainwritings/1/results");
    });
  });

  describe("参加ボタン", () => {
    it("参加ボタンをクリックするとhandleJoinが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<BrainwritingInviteClient brainwriting={mockBrainwriting} token="test-token" />);

      await user.click(screen.getByRole("button", { name: "参加する" }));

      expect(mockHandleJoin).toHaveBeenCalled();
    });
  });
});
