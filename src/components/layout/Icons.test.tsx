import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { XIcon } from "./Icons";

describe("XIcon", () => {
  it("SVGアイコンがレンダリングされる", () => {
    const { container } = render(<XIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("デフォルトのクラス名が適用される", () => {
    const { container } = render(<XIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("h-5", "w-5");
  });

  it("カスタムクラス名が適用される", () => {
    const { container } = render(<XIcon className="custom-class" />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("custom-class");
  });

  it("sizeプロパティが適用される", () => {
    const { container } = render(<XIcon size={24} />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("viewBoxが正しく設定される", () => {
    const { container } = render(<XIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("fillがcurrentColorに設定される", () => {
    const { container } = render(<XIcon />);

    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("fill", "currentColor");
  });

  it("pathが含まれる", () => {
    const { container } = render(<XIcon />);

    const path = container.querySelector("path");
    expect(path).toBeInTheDocument();
  });
});
