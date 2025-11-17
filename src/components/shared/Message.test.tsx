import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginRequiredMessage } from "./Message";

describe("Message", () => {
  describe("LoginRequiredMessage", () => {
    it("ログイン必須メッセージが表示される", () => {
      render(<LoginRequiredMessage />);

      expect(screen.getByText("ログインが必要です")).toBeInTheDocument();
    });

    it("正しいスタイルでレンダリングされる", () => {
      const { container } = render(<LoginRequiredMessage />);
      const messageElement = container.firstChild as HTMLElement;

      expect(messageElement).toHaveClass("py-8", "text-center");
    });
  });
});
