import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { events } from "aws-amplify/data";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";
import { OsbornChecklistInputData } from "@/types/osborn-checklist";
import { parseJsonSafe } from "@/lib/client-utils";
import { OSBORN_CHECKLIST_EVENT_TYPES } from "@/lib/appsync-events/event-types";
import { useAmplifyConfig } from "@/components/providers/AmplifyProvider";

interface UseOsbornChecklistAIOptions {
  osbornChecklistId: number;
  currentInputs: OsbornChecklistInputData[];
  aiGeneration: {
    status: string;
    errorMessage: string | null;
  } | null;
  onRefresh: () => Promise<void>;
}

export function useOsbornChecklistAI({
  osbornChecklistId,
  currentInputs,
  aiGeneration,
  onRefresh,
}: UseOsbornChecklistAIOptions) {
  const { isConfigured } = useAmplifyConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  // AI生成のステータスに応じてローディング状態を更新
  useEffect(() => {
    if (aiGeneration?.status === "processing" || aiGeneration?.status === "pending") {
      setIsGenerating(true);
      if (!loadingToastId) {
        const toastId = toast.loading("AIでアイデアを生成中...");
        setLoadingToastId(toastId);
      }
    } else {
      setIsGenerating(false);
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
        setLoadingToastId(null);
      }
    }
  }, [aiGeneration?.status, loadingToastId]);

  // AppSync Eventsでリアルタイム更新を購読（IAM認証）
  const fetchLatestData = useCallback(async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error("データ更新エラー:", error);
    }
  }, [onRefresh]);

  useEffect(() => {
    // Amplify設定が完了するまで待機
    if (!isConfigured) {
      return;
    }

    let unsubscribe: { unsubscribe: () => void } | undefined;

    const connect = async () => {
      try {
        // AWS Amplify Eventsでチャンネルを購読（IAM認証、名前空間指定）
        const channel = await events.connect(`osborn/osborn-checklist/${osbornChecklistId}`);

        unsubscribe = channel.subscribe({
          next: (data: unknown) => {
            try {
              const message = typeof data === "string" ? JSON.parse(data) : data;

              // AppSync Eventsのメッセージ構造に対応
              if (message.event && message.event.type) {
                // イベントタイプに応じて処理
                switch (message.event.type) {
                  case OSBORN_CHECKLIST_EVENT_TYPES.AI_GENERATION_COMPLETED:
                    // データを再取得してトーストを表示
                    fetchLatestData();
                    toast.success("AIでアイデアを生成しました！");
                    break;
                  case OSBORN_CHECKLIST_EVENT_TYPES.AI_GENERATION_FAILED:
                    // データを再取得してエラートーストを表示
                    fetchLatestData();
                    break;
                }
              }
            } catch (error) {
              console.error("イベントデータのパースエラー:", error);
            }
          },
          error: (error: unknown) => {
            console.error("AppSync Eventsエラー:", error);
          },
        });
      } catch (error) {
        console.error("AppSync Events接続エラー:", error);
      }
    };

    connect();

    return () => {
      if (unsubscribe) {
        unsubscribe.unsubscribe();
      }
    };
  }, [isConfigured, osbornChecklistId, fetchLatestData]);

  const handleAIGenerate = async () => {
    if (isGenerating) return;

    // 全ての項目が既に入力されているかチェック
    const allChecklistTypes = Object.values(OSBORN_CHECKLIST_TYPES);
    const filledInputs = currentInputs.filter(
      input => input.content && input.content.trim() !== ""
    );

    if (filledInputs.length === allChecklistTypes.length) {
      toast.error("全ての項目が既に入力されています");
      return;
    }

    // AI生成中または完了済みの場合はエラー
    if (aiGeneration?.status === "processing" || aiGeneration?.status === "pending") {
      toast.error("AI生成は既に実行中です");
      return;
    }
    if (aiGeneration?.status === "completed") {
      toast.error("AI生成は既に完了しています");
      return;
    }

    try {
      const response = await fetch(`/api/osborn-checklists/${osbornChecklistId}/ai-generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, { error: "AI生成に失敗しました" });
        toast.error(errorData.error || "AI生成に失敗しました");
        return;
      }

      // AI生成を開始したことを通知（即座に返る）
      await fetchLatestData(); // ステータスを更新
    } catch (error) {
      console.error("AI生成開始エラー:", error);
      toast.error("AI生成の開始に失敗しました");
    }
  };

  return {
    isGenerating,
    handleAIGenerate,
  };
}
