import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { BrainwritingListItem } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import { parseJsonSafe, parseJson } from "@/lib/client-utils";

/**
 * ブレインライティング参加処理を提供するカスタムフック
 * 
 * ログイン状態に応じてログインページへのリダイレクトまたは参加処理を実行します。
 * 参加後は利用範囲に応じて適切なページにルーティングします。
 * 
 * @param brainwriting - ブレインライティングの情報
 * @param token - 招待トークン
 * @param isLoggedIn - ログイン状態
 * @returns handleJoin - 参加処理を実行する関数
 */
export function useBrainwritingJoin(
  brainwriting: BrainwritingListItem,
  token: string,
  isLoggedIn: boolean
) {
  const router = useRouter();

  const handleJoin = async () => {
    if (!isLoggedIn) {
      // 未ログイン時はログインページへ（中間ページ経由で現在のページに戻る）
      const redirectUrl = encodeURIComponent(`/brainwritings/invite/${token}`);
      await signIn("google", {
        callbackUrl: `/auth/callback?redirect=${redirectUrl}`,
      });
      return;
    }

    // ログイン済み時は参加処理
    try {
      const response = await fetch("/api/brainwritings/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brainwritingId: brainwriting.id,
          usageScope: brainwriting.usageScope,
        }),
      });

      if (!response.ok) {
        const errorData = await parseJsonSafe(response, {
          error: "参加に失敗しました",
        });
        toast.error(errorData.error || "参加に失敗しました");
        return;
      }

      const data = await parseJson<{ sheetId: number }>(response, "参加データの読み込みに失敗しました");

      if (brainwriting.usageScope === USAGE_SCOPE.XPOST) {
        // X投稿版の場合
        const lockDurationMinutes =
          Number(process.env.NEXT_PUBLIC_BRAINWRITING_LOCK_DURATION_MINUTES) || 10;
        toast.success(`参加しました\n回答時間は${lockDurationMinutes}分です`, {
          duration: 5000,
        });
        router.push(`/brainwritings/sheet/${data.sheetId}/input`);
      } else if (brainwriting.usageScope === USAGE_SCOPE.TEAM) {
        // チーム利用版の場合
        toast.success("参加しました", {
          duration: 5000,
        });
        router.push(`/brainwritings/${brainwriting.id}/team`);
      }
    } catch (error) {
      console.error("参加処理エラー:", error);
      toast.error("参加処理中にエラーが発生しました");
    }
  };

  return { handleJoin };
}
