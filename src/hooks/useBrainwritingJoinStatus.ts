import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import { parseJson } from "@/lib/client-utils";

export interface BrainwritingJoinStatus {
  isLocked?: boolean;
  lockExpiresAt?: Date | null;
  currentCount: number;
  maxCount: number;
  isFull: boolean;
  canJoin?: boolean;
}

/**
 * ブレインライティングの参加状況をポーリングで取得するカスタムフック
 * 
 * 10秒ごとに参加状況をAPIから取得し、ロック状態・参加人数・満員状態を管理します。
 * エラーが3回連続で発生した場合はポーリングを停止します。
 * 
 * @param brainwritingId - ブレインライティングのID
 * @param usageScope - 利用範囲（XPOST または TEAM）
 * @param isLoggedIn - ログイン状態
 * @returns status - 参加状況（null の場合は読み込み中）
 */
export function useBrainwritingJoinStatus(
  brainwritingId: number,
  usageScope: string,
  isLoggedIn: boolean
) {
  const [status, setStatus] = useState<BrainwritingJoinStatus | null>(null);
  const errorCountRef = useRef(0);

  useEffect(() => {
    const MAX_ERRORS = 3;
    let intervalId: NodeJS.Timeout | null = null;

    const checkJoinStatus = async () => {
      if (isLoggedIn && brainwritingId) {
        try {
          const response = await fetch(
            `/api/brainwritings/${brainwritingId}/join-status?usageScope=${usageScope}`
          );

          if (!response.ok) {
            throw new Error("参加状況の取得に失敗しました");
          }

          const data = await parseJson<{
            isLocked?: boolean;
            lockExpiresAt?: string | null;
            currentCount: number;
            maxCount: number;
            isFull: boolean;
            canJoin?: boolean;
          }>(response, "参加状況の読み込みに失敗しました");

          // 成功時はエラーカウンターをリセット
          errorCountRef.current = 0;

          // X投稿版の場合はロック情報も含める
          if (usageScope === USAGE_SCOPE.XPOST) {
            setStatus({
              isLocked: data.isLocked || false,
              lockExpiresAt: data.lockExpiresAt ? new Date(data.lockExpiresAt) : null,
              currentCount: data.currentCount || 0,
              maxCount: data.maxCount || 6,
              isFull: data.isFull || false,
            });
          } else {
            // チーム版の場合はロック情報なし
            setStatus({
              currentCount: data.currentCount || 0,
              maxCount: data.maxCount || 6,
              isFull: data.isFull || false,
              canJoin: data.canJoin !== false,
            });
          }
        } catch (error) {
          console.error("ロック状態チェックエラー:", error);
          errorCountRef.current += 1;
          if (errorCountRef.current >= MAX_ERRORS) {
            // 最大エラー回数に達したらポーリングを停止
            if (intervalId) {
              clearInterval(intervalId);
            }
            toast.error("参加状況の取得に失敗しました。ページを再読み込みしてください。");
          }
        }
      }
    };

    checkJoinStatus(); // 初回実行

    // 10秒ごとに定期的にチェック
    intervalId = setInterval(checkJoinStatus, 10000);

    // クリーンアップ関数
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn, brainwritingId, usageScope]);

  return { status };
}
