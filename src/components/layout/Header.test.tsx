import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

// next/linkのモック
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// next/imageのモック
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

// next-auth/reactのモック
const mockSession = vi.fn();
const mockSignOut = vi.fn();
vi.mock("next-auth/react", () => ({
  useSession: () => mockSession(),
  signOut: (options?: { callbackUrl?: string }) => mockSignOut(options),
}));

// next/navigationのモック
const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

// GoogleLoginButtonのモック
vi.mock("@/components/shared/Button", () => ({
  GoogleLoginButton: () => <button>Googleでログイン</button>,
}));

// lucide-reactのモック
vi.mock("lucide-react", () => ({
  Menu: () => <svg data-testid="menu-icon" />,
  X: () => <svg data-testid="x-icon" />,
  ChevronDown: ({ className }: { className?: string }) => (
    <svg className={className} data-testid="chevron-icon" />
  ),
}));

describe("Header", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/guide");
    sessionStorage.setItem("homeContentShown", "true");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe("基本表示", () => {
    it("ロゴが表示される", () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      render(<Header />);

      const logo = screen.getByAltText("アイデア研究所");
      expect(logo).toBeInTheDocument();
      expect(logo.closest("a")).toHaveAttribute("href", "/");
    });

    it("ガイドリンクが表示される", () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      render(<Header />);

      const guideLink = screen.getByText("ガイド");
      expect(guideLink).toBeInTheDocument();
      expect(guideLink.closest("a")).toHaveAttribute("href", "/guide");
    });
  });

  describe("ログイン状態による表示", () => {
    it("未ログイン時、Googleログインボタンが表示される", () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      render(<Header />);

      expect(screen.getAllByText("Googleでログイン")[0]).toBeInTheDocument();
    });

    it("ログイン時、フレームワークメニューが表示される", () => {
      mockSession.mockReturnValue({ data: { user: { name: "Test User" } }, status: "authenticated" });
      render(<Header />);

      expect(screen.getAllByText("フレームワーク")[0]).toBeInTheDocument();
    });

    it("ログイン時、アイデア一覧リンクが表示される", () => {
      mockSession.mockReturnValue({ data: { user: { name: "Test User" } }, status: "authenticated" });
      render(<Header />);

      const link = screen.getByText("アイデア一覧");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "/idea-categories");
    });

    it("ログイン時、マイページリンクが表示される", () => {
      mockSession.mockReturnValue({ data: { user: { name: "Test User" } }, status: "authenticated" });
      render(<Header />);

      const link = screen.getByText("マイページ");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "/mypage");
    });

    it("ログイン時、ログアウトボタンが表示される", () => {
      mockSession.mockReturnValue({ data: { user: { name: "Test User" } }, status: "authenticated" });
      render(<Header />);

      expect(screen.getAllByText("ログアウト")[0]).toBeInTheDocument();
    });
  });

  describe("フレームワークドロップダウン", () => {
    beforeEach(() => {
      mockSession.mockReturnValue({ data: { user: { name: "Test User" } }, status: "authenticated" });
    });

    it("フレームワークボタンをクリックするとドロップダウンが開く", async () => {
      const user = userEvent.setup();
      render(<Header />);

      const frameworkButton = screen.getAllByText("フレームワーク")[0];
      await user.click(frameworkButton);

      expect(screen.getAllByText("ブレインライティング")[0]).toBeInTheDocument();
      expect(screen.getAllByText("マンダラート")[0]).toBeInTheDocument();
      expect(screen.getAllByText("オズボーンのチェックリスト")[0]).toBeInTheDocument();
    });

    it("フレームワークボタンをクリックするとChevronアイコンが回転する", async () => {
      const user = userEvent.setup();
      render(<Header />);

      // 初期状態では回転していない
      const chevronIcon = screen.getAllByTestId("chevron-icon")[0];
      expect(chevronIcon).not.toHaveClass("rotate-180");

      // クリック後は回転する
      const frameworkButton = screen.getAllByText("フレームワーク")[0];
      await user.click(frameworkButton);

      expect(chevronIcon).toHaveClass("rotate-180");
    });

    it("ドロップダウン外をクリックするとメニューが閉じる", async () => {
      const user = userEvent.setup();
      const { container } = render(<Header />);

      // ドロップダウンを開く
      const frameworkButton = screen.getAllByText("フレームワーク")[0];
      await user.click(frameworkButton);

      // ChevronDownアイコンが回転していることを確認
      const chevronIcon = screen.getAllByTestId("chevron-icon")[0];
      expect(chevronIcon).toHaveClass("rotate-180");

      // 外側をクリック
      await user.click(container);

      await waitFor(() => {
        const updatedChevronIcon = screen.getAllByTestId("chevron-icon")[0];
        expect(updatedChevronIcon).not.toHaveClass("rotate-180");
      });
    });
  });

  describe("モバイルメニュー", () => {
    it("ハンバーガーメニューボタンをクリックするとモバイルメニューが開く", async () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: "メニューを開く" });
      await user.click(menuButton);

      expect(menuButton).toHaveAttribute("aria-expanded", "true");
    });

    it("モバイルメニューを開くとXアイコンが表示される", async () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      const user = userEvent.setup();
      render(<Header />);

      const menuButton = screen.getByRole("button", { name: "メニューを開く" });
      
      // 初期状態ではメニューアイコンが表示されている
      expect(screen.getByTestId("menu-icon").parentElement).not.toHaveClass("hidden");
      
      await user.click(menuButton);

      // クリック後はXアイコンが表示される
      await waitFor(() => {
        expect(screen.getByTestId("x-icon").parentElement).not.toHaveClass("hidden");
      });
    });
  });

  describe("ログアウト機能", () => {
    it("ログアウトボタンをクリックするとsignOutが呼ばれる", async () => {
      mockSession.mockReturnValue({ data: { user: { name: "Test User" } }, status: "authenticated" });
      const user = userEvent.setup();
      render(<Header />);

      const logoutButton = screen.getAllByText("ログアウト")[0];
      await user.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/" });
    });
  });

  describe("パスに基づく条件付き表示", () => {
    it("トップページでhomeContentShownがfalseの場合、ヘッダーが表示されない", () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      mockPathname.mockReturnValue("/");
      sessionStorage.removeItem("homeContentShown");
      
      const { container } = render(<Header />);

      expect(container.firstChild).toBeNull();
    });

    it("トップページでhomeContentShownがtrueの場合、ヘッダーが表示される", () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      mockPathname.mockReturnValue("/");
      sessionStorage.setItem("homeContentShown", "true");
      
      render(<Header />);

      expect(screen.getByAltText("アイデア研究所")).toBeInTheDocument();
    });

    it("アンマウント時にインターバルがクリアされる", () => {
      mockSession.mockReturnValue({ data: null, status: "unauthenticated" });
      mockPathname.mockReturnValue("/");
      sessionStorage.setItem("homeContentShown", "true");
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");
      
      const { unmount } = render(<Header />);
      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
