import { useCallback } from "react";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";
import { OsbornChecklistInputData } from "@/types/osborn-checklist";
import { useAIGenerationSubscription } from "./useAIGenerationSubscription";

interface UseOsbornChecklistAIOptions {
  osbornChecklistId: number;
  currentInputs: OsbornChecklistInputData[];
  aiGeneration: {
    status: string;
    errorMessage: string | null;
  } | null;
  onRefresh: () => Promise<void>;
}

/**
 * オズボーンのチェックリストAI自動生成機能を管理するカスタムフック
 * AI生成の実行、生成状態の管理、AppSync Eventsによるリアルタイム更新を提供
 * @param options.osbornChecklistId - オズボーンのチェックリストID
 * @param options.currentInputs - 現在の入力データ一覧
 * @param options.aiGeneration - AI生成の状態情報
 * @param options.onRefresh - データ再取得関数
 * @returns isGenerating - AI生成中かどうか, handleAIGenerate - AI生成を開始する関数
 */
export function useOsbornChecklistAI({
  osbornChecklistId,
  currentInputs,
  aiGeneration,
  onRefresh,
}: UseOsbornChecklistAIOptions) {
  // 全ての項目が入力済みかどうかを判定
  const isAllFilled = useCallback(() => {
    const allChecklistTypes = Object.values(OSBORN_CHECKLIST_TYPES);
    const filledInputs = currentInputs.filter(
      input => input.content && input.content.trim() !== ""
    );
    return filledInputs.length === allChecklistTypes.length;
  }, [currentInputs]);

  return useAIGenerationSubscription({
    channel: `osborn/osborn-checklist/${osbornChecklistId}`,
    aiGeneration,
    onRefresh,
    apiEndpoint: `/api/osborn-checklists/${osbornChecklistId}/ai-generate`,
    isAllFilled,
  });
}
