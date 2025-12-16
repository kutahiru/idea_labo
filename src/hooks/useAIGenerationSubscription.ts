import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { events } from "aws-amplify/data";
import { AI_GENERATION_EVENT_TYPES } from "@/lib/appsync-events/event-types";
import { useAmplifyConfig } from "@/components/providers/AmplifyProvider";
import { parseJsonSafe } from "@/lib/client-utils";

interface UseAIGenerationSubscriptionOptions {
  /** AppSync Eventsのチャンネル名（例: "osborn/osborn-checklist/123"） */
  channel: string;
  /** AI生成の状態情報 */
  aiGeneration: {
    status: string;
    errorMessage: string | null;
  } | null;
  /** データ再取得関数 */
  onRefresh: () => Promise<void>;
  /** AI生成APIのエンドポイント */
  apiEndpoint: string;
  /** 全ての項目が入力済みかどうかを判定する関数 */
  isAllFilled: () => boolean;
}

/**
 * AI生成のステータス管理とAppSync Events購読を提供する共通フック
 * オズボーンのチェックリストとマンダラートで共通利用
 * @param options.channel - AppSync Eventsのチャンネル名（例: "osborn/osborn-checklist/123"）
 * @param options.aiGeneration - AI生成の状態情報
 * @param options.onRefresh - データ再取得関数
 * @param options.apiEndpoint - AI生成APIのエンドポイント
 * @param options.isAllFilled - 全ての項目が入力済みかどうかを判定する関数
 * @returns isGenerating - AI生成中かどうか
 * @returns handleAIGenerate - AI生成を開始する関数
 */
export function useAIGenerationSubscription({
  channel,
  aiGeneration,
  onRefresh,
  apiEndpoint,
  isAllFilled,
}: UseAIGenerationSubscriptionOptions) {
  const { isConfigured } = useAmplifyConfig();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);
  const [hasFailedInSession, setHasFailedInSession] = useState(false);

  // AI生成のステータスに応じてローディング状態を更新
  useEffect(() => {
    if (aiGeneration?.status === "processing" || aiGeneration?.status === "pending") {
      setIsGenerating(true);
      if (!loadingToastId) {
        const toastId = toast.loading("AIでアイデアの生成を開始しました", {
          duration: Infinity,
        });
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
  // エラーハンドリングをするためにラップしている
  const fetchLatestData = useCallback(async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error("データ更新エラー:", error);
    }
  }, [onRefresh]);

  // AppSync Eventsに接続してAI生成の完了/失敗イベントを購読
  useEffect(() => {
    // AppSync Events接続に必要なAWS認証情報の設定が完了していなければスキップ
    if (!isConfigured) {
      return;
    }

    let subscription: { unsubscribe: () => void } | undefined;

    // useEffect内でasync/awaitを使うため、関数を分けて即時実行する
    const connect = async () => {
      try {
        // チャンネルに接続
        const eventChannel = await events.connect(channel);

        // チャンネルを購読し、サーバーからのイベントをリッスン
        subscription = eventChannel.subscribe({
          // イベント受信時のコールバック処理を定義
          next: (data: unknown) => {
            try {
              const message = typeof data === "string" ? JSON.parse(data) : data;

              if (message.event && message.event.type) {
                switch (message.event.type) {
                  case AI_GENERATION_EVENT_TYPES.COMPLETED:
                    fetchLatestData();
                    toast.success("AIでアイデアを生成しました");
                    break;
                  case AI_GENERATION_EVENT_TYPES.FAILED:
                    fetchLatestData();
                    setHasFailedInSession(true);
                    toast.error(message.event.errorMessage || "AIでのアイデア生成に失敗しました", {
                      duration: 20000,
                    });
                    break;
                }
              }
            } catch (error) {
              console.error("イベントデータのパースエラー:", error);
            }
          },
          // エラー発生時のコールバック処理を定義
          error: (error: unknown) => {
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
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfigured, channel]);

  /**
   * AI自動生成を開始する
   * バリデーション後、API経由でLambda関数を呼び出してAI生成ジョブを作成
   * 生成完了はAppSync Eventsで通知される
   */
  const handleAIGenerate = useCallback(async () => {
    // 全ての項目が既に入力されているかチェック
    if (isAllFilled()) {
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
      const response = await fetch(apiEndpoint, {
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
  }, [aiGeneration?.status, apiEndpoint, fetchLatestData, hasFailedInSession, isAllFilled]);

  return {
    isGenerating,
    handleAIGenerate,
  };
}
