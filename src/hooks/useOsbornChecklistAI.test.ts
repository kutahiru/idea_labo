import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useOsbornChecklistAI } from "./useOsbornChecklistAI";
import toast from "react-hot-toast";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";

// モックの設定
vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
    loading: vi.fn(() => "loading-toast-id"),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("@/lib/client-utils", () => ({
  parseJsonSafe: vi.fn(async (response: Response, defaultValue: unknown) => {
    if (!response.ok) {
      return defaultValue;
    }
    return response.json();
  }),
}));

describe("useOsbornChecklistAI", () => {
  const mockOnRefresh = vi.fn();
  const defaultProps = {
    osbornChecklistId: 1,
    currentInputs: [],
    aiGeneration: null,
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("初期状態でisGeneratingがfalse", () => {
    const { result } = renderHook(() => useOsbornChecklistAI(defaultProps));

    expect(result.current.isGenerating).toBe(false);
  });

  it("全ての項目が既に入力されている場合、エラートーストを表示し、API呼び出しをしない", async () => {
    const allChecklistTypes = Object.values(OSBORN_CHECKLIST_TYPES);
    const filledInputs = allChecklistTypes.map(type => ({
      id: 1,
      osborn_checklist_id: 1,
      checklist_type: type,
      content: "入力済みの内容",
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const { result } = renderHook(() =>
      useOsbornChecklistAI({
        ...defaultProps,
        currentInputs: filledInputs,
      })
    );

    await result.current.handleAIGenerate();

    expect(toast.error).toHaveBeenCalledWith("全ての項目が既に入力されています");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("API呼び出しが成功した場合、データを再取得する", async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ generationId: 1, status: "pending" }),
    } as Response);

    const { result } = renderHook(() => useOsbornChecklistAI(defaultProps));

    await result.current.handleAIGenerate();

    expect(global.fetch).toHaveBeenCalledWith("/api/osborn-checklists/1/ai-generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // データ再取得が呼ばれることを確認
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it("API呼び出しが失敗した場合、エラートーストを表示", async () => {
    const mockResponse = {
      ok: false,
      json: async () => ({ error: "テーマが適切ではありません" }),
    } as Response;

    vi.mocked(global.fetch).mockResolvedValue(mockResponse);

    // parseJsonSafeのモックを上書き
    const { parseJsonSafe } = await import("@/lib/client-utils");
    vi.mocked(parseJsonSafe).mockResolvedValue({ error: "テーマが適切ではありません" });

    const { result } = renderHook(() => useOsbornChecklistAI(defaultProps));

    await result.current.handleAIGenerate();

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("テーマが適切ではありません");
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("ネットワークエラーが発生した場合、エラートーストを表示", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useOsbornChecklistAI(defaultProps));

    await result.current.handleAIGenerate();

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("AI生成の開始に失敗しました");
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("aiGeneration.statusがprocessingの場合、isGeneratingがtrueになる", async () => {
    const { result, rerender } = renderHook(
      (props) => useOsbornChecklistAI(props),
      {
        initialProps: {
          ...defaultProps,
          aiGeneration: { status: "processing", errorMessage: null },
        },
      }
    );

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(true);
    });
    expect(toast.loading).toHaveBeenCalledWith("AIでアイデアの生成を開始しました");

    // ステータスをcompletedに変更
    rerender({
      ...defaultProps,
      aiGeneration: { status: "completed", errorMessage: null },
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it("aiGeneration.statusがprocessingの場合、重複実行を防ぐ", async () => {
    const { result } = renderHook(() =>
      useOsbornChecklistAI({
        ...defaultProps,
        aiGeneration: { status: "processing", errorMessage: null },
      })
    );

    await result.current.handleAIGenerate();

    expect(toast.error).toHaveBeenCalledWith("AI生成は既に実行中です");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("一部の項目が入力されている場合、API呼び出しを実行", async () => {
    const partialInputs = [
      {
        id: 1,
        osborn_checklist_id: 1,
        checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
        content: "既存の入力",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ generationId: 1, status: "pending" }),
    } as Response);

    const { result } = renderHook(() =>
      useOsbornChecklistAI({
        ...defaultProps,
        currentInputs: partialInputs,
      })
    );

    await result.current.handleAIGenerate();

    expect(global.fetch).toHaveBeenCalled();
    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it("空白のみの入力は未入力として扱う", async () => {
    const inputsWithWhitespace = [
      {
        id: 1,
        osborn_checklist_id: 1,
        checklist_type: OSBORN_CHECKLIST_TYPES.TRANSFER,
        content: "   ", // 空白のみ
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ generationId: 1, status: "pending" }),
    } as Response);

    const { result } = renderHook(() =>
      useOsbornChecklistAI({
        ...defaultProps,
        currentInputs: inputsWithWhitespace,
      })
    );

    await result.current.handleAIGenerate();

    expect(global.fetch).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalledWith("全ての項目が既に入力されています");
    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
