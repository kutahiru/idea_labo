import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateButton, GoogleLoginButton, XPostButton } from "./Button";

// next-authのモック
vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

// Iconsのモック
vi.mock("@/components/layout/Icons", () => ({
  XIcon: () => <svg data-testid="x-icon" />,
}));

describe("Button", () => {
  describe("CreateButton", () => {
    it("「新規作成」ボタンが表示される", () => {
      render(<CreateButton onClick={vi.fn()} />);

      expect(screen.getByRole("button", { name: /新規作成/i })).toBeInTheDocument();
    });

    it("クリックするとonClickが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<CreateButton onClick={onClick} />);

      const button = screen.getByRole("button", { name: /新規作成/i });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("カスタムクラス名が適用される", () => {
      render(<CreateButton onClick={vi.fn()} className="custom-class" />);

      const button = screen.getByRole("button", { name: /新規作成/i });
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("GoogleLoginButton", () => {
    it("「Google ログイン」ボタンが表示される", () => {
      render(<GoogleLoginButton />);

      expect(screen.getByRole("button", { name: /Google ログイン/i })).toBeInTheDocument();
    });

    it("クリックするとsignInが呼ばれる", async () => {
      const user = userEvent.setup();
      const { signIn } = await import("next-auth/react");
      render(<GoogleLoginButton />);

      const button = screen.getByRole("button", { name: /Google ログイン/i });
      await user.click(button);

      expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/auth/callback" });
    });
  });

  describe("XPostButton", () => {
    it("ボタン名が表示される", () => {
      render(<XPostButton buttonName="ポストする" onClick={vi.fn()} />);

      expect(screen.getByRole("button", { name: /ポストする/i })).toBeInTheDocument();
    });

    it("Xアイコンが表示される", () => {
      render(<XPostButton buttonName="ポストする" onClick={vi.fn()} />);

      expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    });

    it("クリックするとonClickが呼ばれる", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<XPostButton buttonName="ポストする" onClick={onClick} />);

      const button = screen.getByRole("button", { name: /ポストする/i });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("disabledがtrueの時、ボタンが無効化される", () => {
      render(<XPostButton buttonName="ポストする" onClick={vi.fn()} disabled={true} />);

      const button = screen.getByRole("button", { name: /ポストする/i });
      expect(button).toBeDisabled();
    });

    it("disabledがtrueの時、クリックしてもonClickが呼ばれない", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<XPostButton buttonName="ポストする" onClick={onClick} disabled={true} />);

      const button = screen.getByRole("button", { name: /ポストする/i });
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it("disabledがtrueの時、グレーの背景色が適用される", () => {
      render(<XPostButton buttonName="ポストする" onClick={vi.fn()} disabled={true} />);

      const button = screen.getByRole("button", { name: /ポストする/i });
      expect(button).toHaveClass("bg-gray-400");
    });

    it("disabledがfalseの時、黒の背景色が適用される", () => {
      render(<XPostButton buttonName="ポストする" onClick={vi.fn()} disabled={false} />);

      const button = screen.getByRole("button", { name: /ポストする/i });
      expect(button).toHaveClass("bg-black");
    });
  });
});
