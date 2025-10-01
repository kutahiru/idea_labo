"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import BrainwritingInfo from "@/components/brainwriting/BrainwritingInfo";
import { BrainwritingListItem } from "@/types/brainwriting";

interface BrainwritingInviteClientProps {
  brainwriting: BrainwritingListItem;
  token: string;
}

export default function BrainwritingInviteClient({
  brainwriting,
  token,
}: BrainwritingInviteClientProps) {
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const [status, setStatus] = useState<{
    isLocked: boolean;
    lockedByUser: string | null;
    lockExpiresAt: Date | null;
    currentCount: number;
    maxCount: number;
    isFull: boolean;
  } | null>(null);

  // ログイン後にロック状態をチェック
  useEffect(() => {
    const checkLockStatus = async () => {
      if (isLoggedIn && brainwriting.id) {
        try {
          const response = await fetch(`/api/brainwriting/${brainwriting.id}/join-status`);
          if (response.ok) {
            const data = await response.json();
            setStatus({
              isLocked: data.isLocked || false,
              lockedByUser: data.lockedByUser || null,
              lockExpiresAt: data.lockExpiresAt ? new Date(data.lockExpiresAt) : null,
              currentCount: data.currentCount || 0,
              maxCount: data.maxCount || 6,
              isFull: data.isFull || false,
            });
          }
        } catch (error) {
          console.error("ロック状態チェックエラー:", error);
        }
      }
    };

    checkLockStatus();
  }, [isLoggedIn, brainwriting.id]);

  const handleJoinBrainwriting = async () => {
    if (!isLoggedIn) {
      // 未ログイン時はログインページへ（callbackUrlで現在のページに戻る）
      await signIn("google", {
        callbackUrl: `/brainwriting/invite/${token}`,
      });
      return;
    }

    // ログイン済み時は参加処理
    try {
      const response = await fetch("/api/brainwriting/join", {
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
        alert(data.error || "参加に失敗しました");
        return;
      }

      alert("参加しました！");
      // 参加後はブレインライティング入力ページへ遷移
      window.location.href = `/brainwriting/sheet/${data.sheetId}/input`;
    } catch (error) {
      console.error("参加処理エラー:", error);
      alert("参加処理中にエラーが発生しました");
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

  return (
    <div className="py-2">
      <div className="mx-auto max-w-4xl">
        <BrainwritingInfo brainwriting={brainwriting} />

        <div className="mb-8 text-center">
          <h1 className="text-primary mb-4 text-3xl font-bold">
            ブレインライティングに招待されました
          </h1>
        </div>

        <div className="mt-8 text-center">
          {status?.isFull ? (
            <div>
              <div className="mb-4 text-center">
                <p className="mb-2 font-medium text-red-600">参加人数が上限に達しています</p>
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
                <p className="mb-2 font-medium text-red-600">他の方が編集中です</p>
                <p className="text-sm text-gray-600">
                  {status.lockExpiresAt &&
                    `最長で${status.lockExpiresAt.toLocaleString()}まで編集がロックされています`}
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
                className="group bg-primary inline-flex items-center rounded-md px-20 py-2 text-base font-medium text-white transition-transform hover:scale-105"
              >
                {isLoggedIn ? "参加する" : "ログインして参加する"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
