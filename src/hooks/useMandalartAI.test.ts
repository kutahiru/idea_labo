import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMandalartAI } from "./useMandalartAI";
import toast from "react-hot-toast";

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

vi.mock("@/components/providers/AmplifyProvider", () => ({
  useAmplifyConfig: vi.fn(() => ({ isConfigured: false })),
}));

vi.mock("aws-amplify/data", () => ({
  events: {
    connect: vi.fn(),
  },
}));

describe("useMandalartAI", () => {
  const mockOnRefresh = vi.fn();
  const defaultProps = {
    mandalartId: 1,
    currentInputs: [],
    aiGeneration: null,
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("初期状態でisGeneratingがfalse", () => {
    const { result } = renderHook(() => useMandalartAI(defaultProps));

    expect(result.current.isGenerating).toBe(false);
  });

  it("全ての項目が既に入力されている場合、エラートーストを表示し、API呼び出しをしない", async () => {
    // マンダラートは72セル（8サブテーマ + 64アイデア）が対象
    const filledInputs = Array.from({ length: 72 }, (_, i) => ({
      id: i + 1,
      mandalart_id: 1,
      section_row_index: Math.floor(i / 24),
      section_column_index: (i % 24) % 3,
      row_index: Math.floor((i % 8) / 3),
      column_index: (i % 8) % 3,
      content: "入力済みの内容",
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const { result } = renderHook(() =>
      useMandalartAI({
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

    const { result } = renderHook(() => useMandalartAI(defaultProps));

    await result.current.handleAIGenerate();

    expect(global.fetch).toHaveBeenCalledWith("/api/mandalarts/1/ai-generate", {
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

    const { result } = renderHook(() => useMandalartAI(defaultProps));

    await result.current.handleAIGenerate();

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("テーマが適切ではありません");
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("ネットワークエラーが発生した場合、エラートーストを表示", async () => {
    vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useMandalartAI(defaultProps));

    await result.current.handleAIGenerate();

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("AI生成の開始に失敗しました");
    expect(mockOnRefresh).not.toHaveBeenCalled();
  });

  it("aiGeneration.statusがprocessingの場合、isGeneratingがtrueになる", async () => {
    const { result, rerender } = renderHook(
      (props) => useMandalartAI(props),
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
    expect(toast.loading).toHaveBeenCalledWith("AIでアイデアの生成を開始しました", { duration: Infinity });

    // ステータスをcompletedに変更
    rerender({
      ...defaultProps,
      aiGeneration: { status: "completed", errorMessage: null },
    });

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });

  it("aiGeneration.statusがpendingの場合、isGeneratingがtrueになる", async () => {
    const { result } = renderHook(() =>
      useMandalartAI({
        ...defaultProps,
        aiGeneration: { status: "pending", errorMessage: null },
      })
    );

    await waitFor(() => {
      expect(result.current.isGenerating).toBe(true);
    });
    expect(toast.loading).toHaveBeenCalledWith("AIでアイデアの生成を開始しました", { duration: Infinity });
  });

  it("aiGeneration.statusがprocessingの場合、重複実行を防ぐ", async () => {
    const { result } = renderHook(() =>
      useMandalartAI({
        ...defaultProps,
        aiGeneration: { status: "processing", errorMessage: null },
      })
    );

    await result.current.handleAIGenerate();

    expect(toast.error).toHaveBeenCalledWith("AI生成は既に実行中です");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("aiGeneration.statusがpendingの場合、重複実行を防ぐ", async () => {
    const { result } = renderHook(() =>
      useMandalartAI({
        ...defaultProps,
        aiGeneration: { status: "pending", errorMessage: null },
      })
    );

    await result.current.handleAIGenerate();

    expect(toast.error).toHaveBeenCalledWith("AI生成は既に実行中です");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("aiGeneration.statusがcompletedの場合、再生成を防ぐ", async () => {
    const { result } = renderHook(() =>
      useMandalartAI({
        ...defaultProps,
        aiGeneration: { status: "completed", errorMessage: null },
      })
    );

    await result.current.handleAIGenerate();

    expect(toast.error).toHaveBeenCalledWith("AI生成は10分に1回可能です");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("一部の項目が入力されている場合、API呼び出しを実行", async () => {
    const partialInputs = [
      {
        id: 1,
        mandalart_id: 1,
        section_row_index: 1,
        section_column_index: 1,
        row_index: 0,
        column_index: 0,
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
      useMandalartAI({
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
        mandalart_id: 1,
        section_row_index: 1,
        section_column_index: 1,
        row_index: 0,
        column_index: 0,
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
      useMandalartAI({
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
