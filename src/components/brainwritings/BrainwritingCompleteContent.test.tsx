import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingCompleteContent from "./BrainwritingCompleteContent";
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

// x-postのモック
const mockPostBrainwritingToX = vi.fn();
vi.mock("@/lib/x-post", () => ({
  postBrainwritingToX: (...args: unknown[]) => mockPostBrainwritingToX(...args),
}));

describe("BrainwritingCompleteContent", () => {
  const mockBrainwriting: BrainwritingListItem = {
    id: 1,
    title: "テストブレインライティング",
    themeName: "テストテーマ",
    description: "テスト説明",
    userId: "user-1",
    createdAt: new Date(),
    usageScope: USAGE_SCOPE.XPOST,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("回答完了タイトルが表示される", () => {
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      expect(screen.getByText("回答完了")).toBeInTheDocument();
    });

    it("完了メッセージが表示される", () => {
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      expect(screen.getByText(/ブレインライティングへの回答が完了しました/)).toBeInTheDocument();
      expect(screen.getByText(/ご協力ありがとうございました/)).toBeInTheDocument();
    });

    it("残りユーザーがいる場合、共有をお願いするメッセージが表示される", () => {
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      expect(screen.getByText(/次の回答者のためにXに共有をお願いします/)).toBeInTheDocument();
    });

    it("残りユーザーがいない場合、完了メッセージが表示される", () => {
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={0}
        />
      );

      expect(screen.getByText(/回答が完了したことをXに共有しましょう/)).toBeInTheDocument();
    });

    it("トップページに戻るボタンが表示される", () => {
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      expect(screen.getByRole("button", { name: "トップページに戻る" })).toBeInTheDocument();
    });

    it("共有ボタンが表示される", () => {
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      expect(screen.getByRole("button", { name: /共有/ })).toBeInTheDocument();
    });
  });

  describe("操作", () => {
    it("トップページに戻るボタンをクリックするとトップページに遷移する", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      await user.click(screen.getByRole("button", { name: "トップページに戻る" }));

      expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("共有ボタンをクリックするとX投稿関数が呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingCompleteContent
          brainwriting={mockBrainwriting}
          remainingUserCount={3}
        />
      );

      await user.click(screen.getByRole("button", { name: /共有/ }));

      expect(mockPostBrainwritingToX).toHaveBeenCalledWith({
        brainwriting: mockBrainwriting,
        isOwner: false,
        remainingUserCount: 3,
      });
    });
  });
});
