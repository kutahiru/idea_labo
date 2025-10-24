"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import toast from "react-hot-toast";
import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import { BrainwritingListItem } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

interface BrainwritingInviteClientProps {
  brainwriting: BrainwritingListItem;
  token: string;
}

export default function BrainwritingInviteClient({
  brainwriting,
  token,
}: BrainwritingInviteClientProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const [status, setStatus] = useState<{
    isLocked?: boolean;
    lockExpiresAt?: Date | null;
    currentCount: number;
    maxCount: number;
    isFull: boolean;
    canJoin?: boolean;
  } | null>(null);

  // ログイン後にロック状態をチェック（定期的に更新）
  useEffect(() => {
    const checkLockStatus = async () => {
      if (isLoggedIn && brainwriting.id) {
        try {
          const response = await fetch(
            `/api/brainwritings/${brainwriting.id}/join-status?usageScope=${brainwriting.usageScope}`
          );
          if (response.ok) {
            const data = await response.json();

            // X投稿版の場合はロック情報も含める
            if (brainwriting.usageScope === USAGE_SCOPE.XPOST) {
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
          }
        } catch (error) {
          console.error("ロック状態チェックエラー:", error);
        }
      }
    };

    checkLockStatus(); // 初回実行

    // 10秒ごとに定期的にチェック
    const interval = setInterval(checkLockStatus, 10000);

    // クリーンアップ関数
    return () => clearInterval(interval);
  }, [isLoggedIn, brainwriting.id, brainwriting.usageScope]);

  const handleJoinBrainwriting = async () => {
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

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "参加に失敗しました");
        return;
      }

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

  if (sessionStatus === "loading") {
    return (
      <div className="py-2">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="text-gray-600">読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  // ログイン済みでステータス読み込み中
  if (isLoggedIn && status === null) {
    return (
      <div className="py-2">
        <div className="mx-auto max-w-4xl">
          <IdeaFrameworkInfo ideaFramework={brainwriting} />
          <div className="mb-8 text-center">
            <h1 className="text-primary mb-4 text-3xl font-bold">
              ブレインライティングに招待されました
            </h1>
          </div>
          <div className="mt-8 text-center">
            <div className="text-gray-600">参加状況を確認中...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="mx-auto max-w-4xl">
        <IdeaFrameworkInfo ideaFramework={brainwriting} />

        <div className="mb-4 text-center">
          <h1 className="text-primary mb-6 text-3xl font-bold">
            ブレインライティングに招待されました
          </h1>

          <div className="mx-auto mb-2 max-w-2xl rounded-lg bg-blue-50 p-6 text-left">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">ブレインライティングとは？</h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              ブレインライティングは、複数人でアイデアを出し合う発想法です。
              <br />
              回覧板のようにシートを回していき、前の人のアイデアを参考にしながら新しいアイデアを発展させていきます。
              <br />
              発言が苦手なメンバーでも参加しやすく、多様な視点からアイデアを広げることができます。
            </p>
            <div className="border-t border-blue-200 pt-4">
              <p className="font-semibold text-gray-800">ぜひご協力お願いします！</p>
              <p className="text-gray-700">あなたの創造的なアイデアをお待ちしています。</p>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center">
          {status?.canJoin === false ? (
            <div>
              <div className="mb-4 text-center">
                <p className="text-alert mb-2 font-medium">参加できません</p>
                <p className="text-sm text-gray-600">ブレインライティングは既に開始されています</p>
              </div>
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-md bg-gray-400 px-20 py-2 text-base font-medium text-white"
              >
                参加できません
              </button>
            </div>
          ) : status?.isFull ? (
            <div>
              <div className="mb-4 text-center">
                <p className="text-alert mb-2 font-medium">参加人数が上限に達しています</p>
                <p className="text-sm text-gray-600">
                  現在 {status.currentCount}/{status.maxCount} 人が参加中です
                </p>
              </div>
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-md bg-gray-400 px-20 py-2 text-base font-medium text-white"
              >
                参加できません
              </button>
            </div>
          ) : status?.isLocked ? (
            <div>
              <div className="mb-4 text-center">
                <p className="text-alert mb-2 text-lg font-medium">他の方が編集中です</p>
                <p className="text-lg text-gray-600">
                  {status.lockExpiresAt &&
                    (() => {
                      const date = new Date(status.lockExpiresAt);
                      // 秒を0にして1分加算
                      date.setSeconds(0, 0);
                      date.setMinutes(date.getMinutes() + 1);
                      return `最長で${date
                        .toLocaleString("ja-JP", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })
                        .replace(/\//g, "/")
                        .replace(",", "")}まで編集がロックされています`;
                    })()}
                </p>
              </div>
              <button
                disabled
                className="inline-flex cursor-not-allowed items-center rounded-md bg-gray-400 px-20 py-2 text-base font-medium text-white"
              >
                参加できません
              </button>
            </div>
          ) : (
            <div>
              {status && (
                <div className="mb-4 text-center">
                  <p className="text-sm text-gray-600">
                    現在 {status.currentCount}/{status.maxCount} 人が参加中
                  </p>
                </div>
              )}
              <button
                onClick={handleJoinBrainwriting}
                className="menu-link group bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                {isLoggedIn ? "参加する" : "ログインして参加する"}
              </button>
            </div>
          )}
        </div>

        {/* 結果確認ボタン */}
        {brainwriting.isResultsPublic && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push(`/brainwritings/${brainwriting.id}/results`)}
              className="menu-link bg-primary inline-flex items-center rounded-md px-8 py-2 text-base font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              結果を確認
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
