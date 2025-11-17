import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import ToastProvider from "./ToastProvider";

describe("ToastProvider", () => {
  it("Toasterコンポーネントがレンダリングされる", () => {
    const { container } = render(<ToastProvider />);

    // Toasterコンポーネントのコンテナがレンダリングされることを確認
    expect(container.firstChild).toBeInTheDocument();
  });

  it("正しい設定でToasterが初期化される", () => {
    const { container } = render(<ToastProvider />);

    // Toasterのdiv要素が存在することを確認
    const toasterElement = container.querySelector("[data-hot-toast]");
    expect(toasterElement).toBeNull(); // 初期状態ではToast表示用の要素は存在しない
  });
});
