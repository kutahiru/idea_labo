import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IdeaFrameworkModal from "./IdeaFrameworkModal";
import { z } from "zod";
import { BaseIdeaFormData } from "@/schemas/idea-framework";

// framer-motionのモック
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("IdeaFrameworkModal", () => {
  // テスト用のスキーマ
  const testSchema = z.object({
    title: z.string().min(1, "タイトルは必須です"),
    themeName: z.string().min(1, "テーマは必須です"),
    description: z.string().nullable(),
  });

  const initialData: BaseIdeaFormData = {
    title: "初期タイトル",
    themeName: "初期テーマ",
    description: "初期説明",
  };

  const defaultProps = {
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined) as (data: BaseIdeaFormData) => Promise<void>,
    initialData,
    mode: "create" as const,
    schema: testSchema,
  };

  it("作成モードで「新規作成」が表示される", () => {
    render(<IdeaFrameworkModal {...defaultProps} />);

    expect(screen.getByText("新規作成")).toBeInTheDocument();
  });

  it("編集モードで「編集」が表示される", () => {
    render(<IdeaFrameworkModal {...defaultProps} mode="edit" />);

    expect(screen.getByText("編集")).toBeInTheDocument();
  });

  it("初期データが正しく表示される", () => {
    render(<IdeaFrameworkModal {...defaultProps} />);

    expect(screen.getByDisplayValue("初期タイトル")).toBeInTheDocument();
    expect(screen.getByDisplayValue("初期テーマ")).toBeInTheDocument();
    expect(screen.getByDisplayValue("初期説明")).toBeInTheDocument();
  });

  it("タイトルを入力できる", async () => {
    const user = userEvent.setup();
    render(<IdeaFrameworkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText("タイトル *");
    await user.clear(titleInput);
    await user.type(titleInput, "新しいタイトル");

    expect(screen.getByDisplayValue("新しいタイトル")).toBeInTheDocument();
  });

  it("テーマを入力できる", async () => {
    const user = userEvent.setup();
    render(<IdeaFrameworkModal {...defaultProps} />);

    const themeInput = screen.getByLabelText("テーマ *");
    await user.clear(themeInput);
    await user.type(themeInput, "新しいテーマ");

    expect(screen.getByDisplayValue("新しいテーマ")).toBeInTheDocument();
  });

  it("説明を入力できる", async () => {
    const user = userEvent.setup();
    render(<IdeaFrameworkModal {...defaultProps} />);

    const descriptionInput = screen.getByLabelText("説明");
    await user.clear(descriptionInput);
    await user.type(descriptionInput, "新しい説明");

    expect(screen.getByDisplayValue("新しい説明")).toBeInTheDocument();
  });

  it("必須項目が空の場合、バリデーションエラーが表示される", async () => {
    const user = userEvent.setup();
    render(<IdeaFrameworkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText("タイトル *");
    await user.clear(titleInput);

    const submitButton = screen.getByRole("button", { name: "確定" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
    });
  });

  it("バリデーションが成功した場合、onSubmitが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined) as (data: BaseIdeaFormData) => Promise<void>;
    render(<IdeaFrameworkModal {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "確定" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(initialData);
    });
  });

  it("送信成功後、onCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined) as (data: BaseIdeaFormData) => Promise<void>;
    render(<IdeaFrameworkModal {...defaultProps} onClose={onClose} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "確定" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("キャンセルボタンをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<IdeaFrameworkModal {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("オーバーレイをクリックするとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<IdeaFrameworkModal {...defaultProps} onClose={onClose} />);

    const overlay = container.querySelector(".backdrop-blur-sm") as HTMLElement;
    await user.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it("送信中はボタンが無効化される", async () => {
    let resolvePromise: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
      resolvePromise = resolve;
    })) as (data: BaseIdeaFormData) => Promise<void>;
    render(<IdeaFrameworkModal {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "確定" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      expect(cancelButton).toBeDisabled();
    });

    // クリーンアップ：Promiseを解決
    resolvePromise!();
  });

  it("送信中は「保存中...」と表示される", async () => {
    let resolvePromise: () => void;
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => {
      resolvePromise = resolve;
    })) as (data: BaseIdeaFormData) => Promise<void>;
    render(<IdeaFrameworkModal {...defaultProps} onSubmit={onSubmit} />);

    const submitButton = screen.getByRole("button", { name: "確定" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("保存中...")).toBeInTheDocument();
    });

    // クリーンアップ：Promiseを解決
    resolvePromise!();
  });

  it("編集モードで送信ボタンに「更新」と表示される", () => {
    render(<IdeaFrameworkModal {...defaultProps} mode="edit" />);

    expect(screen.getByRole("button", { name: "更新" })).toBeInTheDocument();
  });

  it("エラー入力時、入力すればエラーが消える", async () => {
    const user = userEvent.setup();
    render(<IdeaFrameworkModal {...defaultProps} />);

    // タイトルを空にしてエラーを表示
    const titleInput = screen.getByLabelText("タイトル *");
    await user.clear(titleInput);

    const submitButton = screen.getByRole("button", { name: "確定" });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
    });

    // タイトルを入力してエラーを消す
    await user.type(titleInput, "新しいタイトル");

    await waitFor(() => {
      expect(screen.queryByText("タイトルは必須です")).not.toBeInTheDocument();
    });
  });

  it("カスタムchildrenが表示される", () => {
    const customChildren = <div>カスタムフィールド</div>;
    render(<IdeaFrameworkModal {...defaultProps}>{customChildren}</IdeaFrameworkModal>);

    expect(screen.getByText("カスタムフィールド")).toBeInTheDocument();
  });

  it("関数型childrenが正しく呼ばれる", () => {
    const childrenFn = vi.fn(() => <div>関数型フィールド</div>);
    render(<IdeaFrameworkModal {...defaultProps}>{childrenFn}</IdeaFrameworkModal>);

    expect(screen.getByText("関数型フィールド")).toBeInTheDocument();
    expect(childrenFn).toHaveBeenCalled();
  });
});
