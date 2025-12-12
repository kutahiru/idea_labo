import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { events } from "aws-amplify/data";
import { MandalartInputData } from "@/types/mandalart";
import { parseJsonSafe } from "@/lib/client-utils";
import { MANDALART_EVENT_TYPES } from "@/lib/appsync-events/event-types";
import { useAmplifyConfig } from "@/components/providers/AmplifyProvider";

interface UseMandalartAIOptions {
  mandalartId: number;
  currentInputs: MandalartInputData[];
  aiGeneration: {
    status: string;
    errorMessage: string | null;
  } | null;
  onRefresh: () => Promise<void>;
}

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
  const { isConfigured } = useAmplifyConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [hasFailedInSession, setHasFailedInSession] = useState(false);

  // AI生成のステータスに応じてローディング状態を更新
  useEffect(() => {
    if (aiGeneration?.status === "processing" || aiGeneration?.status === "pending") {
      setIsGenerating(true);
      if (!loadingToastId) {
        const toastId = toast.loading("AIでアイデアの生成を開始しました");
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

  // 最新データを再取得する関数（AppSync Eventsのイベント受信時に呼び出される）
  const fetchLatestData = useCallback(async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error("データ更新エラー:", error);
    }
  }, [onRefresh]);

  // AppSync Eventsに接続してAI生成の完了/失敗イベントを購読
  useEffect(() => {
    // Amplify設定が完了するまで待機
    if (!isConfigured) {
      return;
    }

    let unsubscribe: { unsubscribe: () => void } | undefined;

    const connect = async () => {
      try {
        // AWS Amplify Eventsでチャンネルを購読（IAM認証、名前空間指定）
        const channel = await events.connect(`mandalart/mandalart/${mandalartId}`);

        unsubscribe = channel.subscribe({
          next: (data: unknown) => {
            try {
              const message = typeof data === "string" ? JSON.parse(data) : data;

              if (message.event && message.event.type) {
                // イベントタイプに応じて処理
                switch (message.event.type) {
                  case MANDALART_EVENT_TYPES.AI_GENERATION_COMPLETED:
                    // データを再取得してトーストを表示
                    fetchLatestData();
                    toast.success("AIでアイデアを生成しました");
                    break;
                  case MANDALART_EVENT_TYPES.AI_GENERATION_FAILED:
                    // データを再取得してエラートーストを表示
                    fetchLatestData();
                    setHasFailedInSession(true);
                    toast.error(message.event.errorMessage || "AIでのアイデア生成に失敗しました", {
                      duration: 10000,
                    });
                    break;
                }
              }
            } catch (error) {
              console.error("イベントデータのパースエラー:", error);
            }
          },
          error: (error: unknown) => {
            // エラーオブジェクトの詳細をログ出力
            if (error instanceof Error) {
              console.error("AppSync Eventsエラー:", error.message, error);
            } else {
              console.error("AppSync Eventsエラー:", JSON.stringify(error, null, 2), error);
            }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, mandalartId]);

  /**
   * AI自動生成を開始する
   * バリデーション後、API経由でLambda関数を呼び出してAI生成ジョブを作成
   * 生成完了はAppSync Eventsで通知される
   */
  const handleAIGenerate = async () => {
    // マンダラートは81セル（9×9）あり、中央の9セル（3×3）のうち8セルがサブテーマ
    // 周囲の8セクションにそれぞれ8セルのアイデア = 64セル
    // 合計: 8（サブテーマ）+ 64（アイデア）= 72セルが対象
    // 中央9セルのうち1セル（テーマ名）と各セクションの中央1セル（サブテーマ名）は除外
    const totalTargetCells = 72;
    const filledInputs = currentInputs.filter(
      input => input.content && input.content.trim() !== ""
    );

    if (filledInputs.length >= totalTargetCells) {
      toast.error("全ての項目が既に入力されています");
      return;
    }

    if (aiGeneration?.status === "processing" || aiGeneration?.status === "pending") {
      toast.error("AI生成は既に実行中です");
      return;
    }

    if (aiGeneration?.status === "completed") {
      toast.error("AI生成は10分に1回可能です");
      return;
    }

    if (hasFailedInSession) {
      toast.error("テーマを変更してから再度お試しください");
      return;
    }

    try {
      const response = await fetch(`/api/mandalarts/${mandalartId}/ai-generate`, {
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
