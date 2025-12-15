import { useCallback } from "react";
import { MandalartInputData } from "@/types/mandalart";
import { useAIGenerationSubscription } from "./useAIGenerationSubscription";

interface UseMandalartAIOptions {
  mandalartId: number;
  currentInputs: MandalartInputData[];
  aiGeneration: {
    status: string;
    errorMessage: string | null;
  } | null;
  onRefresh: () => Promise<void>;
}

// マンダラートの入力対象セル数
// 81セル（9×9）のうち、中央の9セルの8セル（サブテーマ）+ 周囲8セクションの各8セル（アイデア）= 72セル
const MANDALART_TARGET_CELLS = 72;

/**
 * マンダラートAI自動生成機能を管理するカスタムフック
 * AI生成の実行、生成状態の管理、AppSync Eventsによるリアルタイム更新を提供
 * @param options.mandalartId - マンダラートID
 * @param options.currentInputs - 現在の入力データ一覧
 * @param options.aiGeneration - AI生成の状態情報
 * @param options.onRefresh - データ再取得関数
 * @returns isGenerating - AI生成中かどうか, handleAIGenerate - AI生成を開始する関数
 */
export function useMandalartAI({
  mandalartId,
  currentInputs,
  aiGeneration,
  onRefresh,
}: UseMandalartAIOptions) {
  // 全ての項目が入力済みかどうかを判定
  const isAllFilled = useCallback(() => {
    const filledInputs = currentInputs.filter(
      input => input.content && input.content.trim() !== ""
    );
    return filledInputs.length >= MANDALART_TARGET_CELLS;
  }, [currentInputs]);

  return useAIGenerationSubscription({
    channel: `mandalart/mandalart/${mandalartId}`,
    aiGeneration,
    onRefresh,
    apiEndpoint: `/api/mandalarts/${mandalartId}/ai-generate`,
    isAllFilled,
  });
}
