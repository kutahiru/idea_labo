import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BrainwritingSheetList from "./BrainwritingSheetList";
import { BrainwritingSheetData, BrainwritingInputData, BrainwritingUserData } from "@/types/brainwriting";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

describe("BrainwritingSheetList", () => {
  const currentUserId = "user-1";

  const mockUsers: BrainwritingUserData[] = [
    { id: 1, brainwriting_id: 1, user_id: "user-1", user_name: "ユーザー1", created_at: new Date(), updated_at: new Date() },
    { id: 2, brainwriting_id: 1, user_id: "user-2", user_name: "ユーザー2", created_at: new Date(), updated_at: new Date() },
    { id: 3, brainwriting_id: 1, user_id: "user-3", user_name: "ユーザー3", created_at: new Date(), updated_at: new Date() },
  ];

  const mockSheets: BrainwritingSheetData[] = [
    { id: 1, brainwriting_id: 1, current_user_id: "user-1", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
    { id: 2, brainwriting_id: 1, current_user_id: "user-2", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
    { id: 3, brainwriting_id: 1, current_user_id: "user-3", lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
  ];

  const mockInputs: BrainwritingInputData[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("未完了時", () => {
    it("シート一覧タイトルが表示される", () => {
      render(
        <BrainwritingSheetList
          sheets={mockSheets}
          inputs={mockInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("シート一覧")).toBeInTheDocument();
    });

    it("各シートのカードが表示される", () => {
      render(
        <BrainwritingSheetList
          sheets={mockSheets}
          inputs={mockInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("シート 1")).toBeInTheDocument();
      expect(screen.getByText("シート 2")).toBeInTheDocument();
      expect(screen.getByText("シート 3")).toBeInTheDocument();
    });

    it("現在のユーザーが表示される", () => {
      render(
        <BrainwritingSheetList
          sheets={mockSheets}
          inputs={mockInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("ユーザー1")).toBeInTheDocument();
      expect(screen.getByText("ユーザー2")).toBeInTheDocument();
      expect(screen.getByText("ユーザー3")).toBeInTheDocument();
    });

    it("自分が編集可能なシートはリンクになる", () => {
      render(
        <BrainwritingSheetList
          sheets={mockSheets}
          inputs={mockInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute("href", "/brainwritings/sheet/1/input");
    });
  });

  describe("全員完了時", () => {
    const completedSheets: BrainwritingSheetData[] = [
      { id: 1, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
      { id: 2, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
      { id: 3, brainwriting_id: 1, current_user_id: null, lock_expires_at: null, created_at: new Date(), updated_at: new Date() },
    ];

    const completedInputs: BrainwritingInputData[] = [
      { id: 1, brainwriting_id: 1, brainwriting_sheet_id: 1, input_user_id: "user-1", input_user_name: "ユーザー1", row_index: 0, column_index: 0, content: "アイデア1", created_at: new Date(), updated_at: new Date() },
    ];

    it("結果確認タイトルが表示される", () => {
      render(
        <BrainwritingSheetList
          sheets={completedSheets}
          inputs={completedInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByText("結果確認")).toBeInTheDocument();
    });

    it("シート切り替えタブが表示される", () => {
      render(
        <BrainwritingSheetList
          sheets={completedSheets}
          inputs={completedInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      expect(screen.getByRole("button", { name: "シート 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "シート 2" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "シート 3" })).toBeInTheDocument();
    });

    it("タブをクリックするとシートが切り替わる", async () => {
      const user = userEvent.setup();
      render(
        <BrainwritingSheetList
          sheets={completedSheets}
          inputs={completedInputs}
          users={mockUsers}
          currentUserId={currentUserId}
        />
      );

      // 初期状態ではシート1がアクティブ
      const sheet1Button = screen.getByRole("button", { name: "シート 1" });
      expect(sheet1Button).toHaveClass("bg-primary");

      // シート2をクリック
      const sheet2Button = screen.getByRole("button", { name: "シート 2" });
      await user.click(sheet2Button);

      expect(sheet2Button).toHaveClass("bg-primary");
    });
  });
});
