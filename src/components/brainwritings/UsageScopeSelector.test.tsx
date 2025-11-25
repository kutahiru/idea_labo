import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsageScopeSelector from "./UsageScopeSelector";
import { USAGE_SCOPE } from "@/utils/brainwriting";

describe("UsageScopeSelector", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("表示", () => {
    it("利用方法ラベルが表示される", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("利用方法")).toBeInTheDocument();
    });

    it("X投稿オプションが表示される", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("X投稿")).toBeInTheDocument();
    });

    it("チーム利用オプションが表示される", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("チーム利用")).toBeInTheDocument();
    });

    it("X投稿が選択されている場合、X投稿ラジオボタンがチェック済み", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
        />
      );

      const xpostRadio = screen.getByRole("radio", { checked: true });
      expect(xpostRadio).toBeChecked();
      expect(xpostRadio).toHaveAttribute("value", USAGE_SCOPE.XPOST);
    });

    it("チーム利用が選択されている場合、チーム利用ラジオボタンがチェック済み", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.TEAM}
          onChange={mockOnChange}
        />
      );

      const teamRadio = screen.getByRole("radio", { checked: true });
      expect(teamRadio).toBeChecked();
      expect(teamRadio).toHaveAttribute("value", USAGE_SCOPE.TEAM);
    });
  });

  describe("選択操作", () => {
    it("チーム利用をクリックするとonChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
        />
      );

      const teamLabel = screen.getByText("チーム利用").closest("label");
      await user.click(teamLabel!);

      expect(mockOnChange).toHaveBeenCalledWith(USAGE_SCOPE.TEAM);
    });

    it("X投稿をクリックするとonChangeが呼ばれる", async () => {
      const user = userEvent.setup();
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.TEAM}
          onChange={mockOnChange}
        />
      );

      const xpostLabel = screen.getByText("X投稿").closest("label");
      await user.click(xpostLabel!);

      expect(mockOnChange).toHaveBeenCalledWith(USAGE_SCOPE.XPOST);
    });
  });

  describe("disabled状態", () => {
    it("disabled=trueの場合、ラジオボタンが無効になる", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      const radios = screen.getAllByRole("radio");
      radios.forEach(radio => {
        expect(radio).toBeDisabled();
      });
    });

    it("disabled=trueの場合、変更不可メッセージが表示される", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      expect(screen.getByText("（編集時は変更できません）")).toBeInTheDocument();
    });

    it("disabled=falseの場合、変更不可メッセージは非表示", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
          disabled={false}
        />
      );

      expect(screen.queryByText("（編集時は変更できません）")).not.toBeInTheDocument();
    });
  });

  describe("エラー表示", () => {
    it("errorsが指定されている場合、エラーメッセージが表示される", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
          errors="利用方法を選択してください"
        />
      );

      expect(screen.getByText("利用方法を選択してください")).toBeInTheDocument();
    });

    it("errorsが指定されていない場合、エラーメッセージは非表示", () => {
      render(
        <UsageScopeSelector
          value={USAGE_SCOPE.XPOST}
          onChange={mockOnChange}
        />
      );

      expect(screen.queryByText("利用方法を選択してください")).not.toBeInTheDocument();
    });
  });
});
