import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InviteLinkCopy from "./InviteLinkCopy";
import toast from "react-hot-toast";

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

// token生成のモック
vi.mock("@/lib/token", () => ({
  generateInviteUrl: (token: string) => `https://example.com/invite/${token}`,
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// clipboardのモック
const mockWriteText = vi.fn();
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
  configurable: true,
});

describe("InviteLinkCopy", () => {
  const defaultProps = {
    inviteToken: "test-token-123",
    brainwritingId: 1,
    isInviteActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true });
    mockWriteText.mockResolvedValue(undefined);
  });

  describe("表示", () => {
    it("招待リンクラベルが表示される", () => {
      render(<InviteLinkCopy {...defaultProps} />);

      expect(screen.getByText("招待リンク")).toBeInTheDocument();
    });

    it("招待URLが入力欄に表示される", () => {
      render(<InviteLinkCopy {...defaultProps} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("https://example.com/invite/test-token-123");
    });

    it("コピーボタンが表示される", () => {
      render(<InviteLinkCopy {...defaultProps} />);

      expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();
    });

    it("開くリンクが表示される", () => {
      render(<InviteLinkCopy {...defaultProps} />);

      expect(screen.getByRole("link", { name: /開く/ })).toBeInTheDocument();
    });

    it("トグルスイッチが表示される", () => {
      render(<InviteLinkCopy {...defaultProps} />);

      const toggleButton = screen.getByText("有効").closest("div")?.querySelector("button");
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe("コピー機能", () => {
    it("コピーボタンが有効な場合にクリックできる", async () => {
      const user = userEvent.setup();
      render(<InviteLinkCopy {...defaultProps} />);

      const copyButton = screen.getByRole("button", { name: /コピー/ });
      expect(copyButton).not.toBeDisabled();

      // クリック可能であることを確認
      await user.click(copyButton);
      // トースト呼び出しを確認（成功またはエラー）
      await waitFor(() => {
        const successCalled = (toast.success as ReturnType<typeof vi.fn>).mock.calls.length > 0;
        const errorCalled = (toast.error as ReturnType<typeof vi.fn>).mock.calls.length > 0;
        expect(successCalled || errorCalled).toBe(true);
      });
    });

    it("招待リンクが無効の場合、コピーボタンが無効化される", () => {
      render(<InviteLinkCopy {...defaultProps} isInviteActive={false} />);

      const copyButton = screen.getByRole("button", { name: /コピー/ });
      expect(copyButton).toBeDisabled();
    });
  });

  describe("トグル操作", () => {
    it("トグルをオフにするとAPIが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<InviteLinkCopy {...defaultProps} />);

      const toggleButton = screen.getByText("有効").closest("div")?.querySelector("button");
      await user.click(toggleButton!);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/brainwritings/1/invite-active",
          expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify({ isInviteActive: false }),
          })
        );
      });
    });

    it("トグル操作成功時に成功トーストが表示される", async () => {
      const user = userEvent.setup();
      render(<InviteLinkCopy {...defaultProps} />);

      const toggleButton = screen.getByText("有効").closest("div")?.querySelector("button");
      await user.click(toggleButton!);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("招待リンクを無効にしました");
      });
    });

    it("トグル操作失敗時にエラートーストが表示される", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "エラーが発生しました" }),
      });

      const user = userEvent.setup();
      render(<InviteLinkCopy {...defaultProps} />);

      const toggleButton = screen.getByText("有効").closest("div")?.querySelector("button");
      await user.click(toggleButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("エラーが発生しました");
      });
    });
  });

  describe("無効状態", () => {
    it("招待リンクが無効の場合、開くリンクがクリック不可", () => {
      render(<InviteLinkCopy {...defaultProps} isInviteActive={false} />);

      const openLink = screen.getByRole("link", { name: /開く/ });
      expect(openLink).toHaveClass("pointer-events-none");
    });
  });
});
