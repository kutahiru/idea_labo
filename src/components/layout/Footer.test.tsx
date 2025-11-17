import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

// next/linkのモック
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// next/navigationのモック
const mockPathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname(),
}));

describe("Footer", () => {
  beforeEach(() => {
    mockPathname.mockReturnValue("/guide");
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("トップページ以外では常にフッターが表示される", () => {
    mockPathname.mockReturnValue("/guide");
    render(<Footer />);

    expect(screen.getByText(/アイデア研究所/)).toBeInTheDocument();
  });

  it("トップページでhomeContentShownがtrueの場合、フッターが表示される", () => {
    mockPathname.mockReturnValue("/");
    sessionStorage.setItem("homeContentShown", "true");

    render(<Footer />);

    expect(screen.getByText(/アイデア研究所/)).toBeInTheDocument();
  });

  it("トップページでhomeContentShownがfalseの場合、フッターが表示されない", () => {
    mockPathname.mockReturnValue("/");
    sessionStorage.removeItem("homeContentShown");

    const { container } = render(<Footer />);

    expect(container.firstChild).toBeNull();
  });

  it("現在の年が表示される", () => {
    mockPathname.mockReturnValue("/guide");
    const currentYear = new Date().getFullYear();

    render(<Footer />);

    expect(screen.getByText(`© ${currentYear} アイデア研究所`)).toBeInTheDocument();
  });

  it("プライバシーポリシーへのリンクが表示される", () => {
    mockPathname.mockReturnValue("/guide");
    render(<Footer />);

    const link = screen.getByText("プライバシーポリシー");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/privacy-policy");
  });

  it("利用規約へのリンクが表示される", () => {
    mockPathname.mockReturnValue("/guide");
    render(<Footer />);

    const link = screen.getByText("利用規約");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/terms-of-service");
  });

  it("アンマウント時にインターバルがクリアされる", () => {
    mockPathname.mockReturnValue("/");
    sessionStorage.setItem("homeContentShown", "true");
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    const { unmount } = render(<Footer />);
    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("トップページでsessionStorageの値が変化したらフッターが表示される", async () => {
    mockPathname.mockReturnValue("/");
    sessionStorage.setItem("homeContentShown", "true");

    render(<Footer />);

    // フッターが表示されていることを確認
    expect(screen.getByText(/アイデア研究所/)).toBeInTheDocument();
  });
});
