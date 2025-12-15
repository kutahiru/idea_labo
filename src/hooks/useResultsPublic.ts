import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { parseJsonSafe } from "@/lib/client-utils";

interface UseResultsPublicOptions {
  /** 結果公開APIのエンドポイント（例: "/api/mandalarts/1/results-public"） */
  apiEndpoint: string;
  /** 初期値 */
  initialValue: boolean;
}

/**
 * 結果公開の状態管理とAPI連携を提供する共通フック
 * マンダラート、オズボーンのチェックリスト、ブレインライティングで共通利用
 * @param options.apiEndpoint - 結果公開APIのエンドポイント
 * @param options.initialValue - 初期値
 * @returns isResultsPublic - 結果公開の状態
 * @returns isUpdating - 更新中かどうか
 * @returns handleUpdateIsResultsPublic - 結果公開の状態を更新する関数
 */
export function useResultsPublic({
  apiEndpoint,
  initialValue,
}: UseResultsPublicOptions) {
  const [isResultsPublic, setIsResultsPublic] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateIsResultsPublic = useCallback(async (newValue: boolean) => {
    // 更新中は処理をスキップ（連打対策）
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isResultsPublic: newValue }),
      });

      if (!response.ok) {
        const error = await parseJsonSafe(response, { error: "結果公開の状態更新に失敗しました" });
        toast.error(error.error || "結果公開の状態更新に失敗しました");
        return;
      }

      setIsResultsPublic(newValue);
      toast.success(newValue ? "結果を公開しました" : "結果を非公開にしました");
    } catch (error) {
      console.error("結果公開の状態更新エラー:", error);
      toast.error("結果公開の状態更新に失敗しました");
    } finally {
      setIsUpdating(false);
    }
  }, [apiEndpoint, isUpdating]);

  return {
    isResultsPublic,
    isUpdating,
    handleUpdateIsResultsPublic,
  };
}
