import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { getBrainwritingTeamByBrainwritingId, checkJoinStatus } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingTeamClient from "@/components/brainwritings/BrainwritingTeamClient";
import { LoginRequiredMessage } from "@/components/shared/Message";

export const metadata: Metadata = {
  title: "ブレインライティング（チーム）",
  description: "チームでアイデアを出し合うブレインライティングセッション",
};

interface BrainwritingTeamPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティング（チーム版）のメインページコンポーネント
 *
 * 認証済みの参加者のみがアクセスできるチーム版ブレインライティングのページです。
 * 参加者は招待URLから参加登録を行い、このページで実際のブレインライティングセッションに参加します。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - 参加者でないユーザー: 404エラー
 *
 * ルート: /brainwritings/[id]/team
 *
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns ブレインライティングチームクライアントコンポーネント、ログイン要求メッセージ、または404ページ
 */
export default async function BrainwritingTeamPage({ params }: BrainwritingTeamPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { id } = await params;
  const brainwritingId = parseInt(id);

  if (isNaN(brainwritingId)) {
    notFound();
  }

  const joinStatus = await checkJoinStatus(brainwritingId, session.user.id);

  if (!joinStatus.isJoined) {
    notFound();
  }

  const brainwritingTeam = await getBrainwritingTeamByBrainwritingId(brainwritingId);

  if (!brainwritingTeam) {
    notFound();
  }

  return (
    <BrainwritingTeamClient brainwritingTeam={brainwritingTeam} currentUserId={session.user.id} />
  );
}
