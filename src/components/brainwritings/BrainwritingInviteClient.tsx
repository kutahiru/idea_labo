"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import IdeaFrameworkInfo from "@/components/shared/IdeaFrameworkInfo";
import { BrainwritingListItem } from "@/types/brainwriting";
import { useBrainwritingJoinStatus } from "@/hooks/useBrainwritingJoinStatus";
import { useBrainwritingJoin } from "@/hooks/useBrainwritingJoin";

interface BrainwritingInviteClientProps {
  brainwriting: BrainwritingListItem;
  token: string;
}

/**
 * ブレインライティング招待ページのクライアントコンポーネント
 *
 * 招待リンクからアクセスしたユーザーに対して、ブレインライティングの説明と
 * 参加ボタンを表示します。参加状況（ロック状態、参加人数、満員状態）を
 * 10秒ごとにポーリングしてリアルタイムで更新します。
 *
 * @param brainwriting - ブレインライティングの情報
 * @param token - 招待トークン
 */
export default function BrainwritingInviteClient({
  brainwriting,
  token,
}: BrainwritingInviteClientProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isLoggedIn = Boolean(session?.user);

  // 参加状況のポーリング処理
  const { status } = useBrainwritingJoinStatus(
    brainwriting.id,
    brainwriting.usageScope,
    isLoggedIn
  );

  // 参加処理
  const { handleJoin } = useBrainwritingJoin(brainwriting, token, isLoggedIn);

  if (sessionStatus === "loading") {
    return (
      <div className="py-2">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <div className="text-muted">読み込み中...</div>
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
            <div className="text-muted">参加状況を確認中...</div>
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
            <h2 className="mb-3 text-xl font-semibold text-foreground">ブレインライティングとは？</h2>
            <p className="mb-4 leading-relaxed text-muted">
              ブレインライティングは、複数人でアイデアを出し合う発想法です。
              <br />
              回覧板のようにシートを回していき、前の人のアイデアを参考にしながら新しいアイデアを発展させていきます。
              <br />
              発言が苦手なメンバーでも参加しやすく、多様な視点からアイデアを広げることができます。
            </p>
            <div className="border-t border-blue-200 pt-4">
              <p className="font-semibold text-foreground">ぜひご協力お願いします！</p>
              <p className="text-muted">あなたの創造的なアイデアをお待ちしています。</p>
            </div>
          </div>
        </div>

        <div className="mt-2 text-center">
          {status?.canJoin === false ? (
            <div>
              <div className="mb-4 text-center">
                <p className="text-alert mb-2 font-medium">参加できません</p>
                <p className="text-sm text-muted">ブレインライティングは既に開始されています</p>
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
                <p className="text-sm text-muted">
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
                <p className="text-lg text-muted">
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
                  <p className="text-sm text-muted">
                    現在 {status.currentCount}/{status.maxCount} 人が参加中
                  </p>
                </div>
              )}
              <button
                onClick={handleJoin}
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
