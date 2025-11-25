import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailById } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingDetailClient from "@/components/brainwritings/BrainwritingDetailClient";
import { LoginRequiredMessage } from "@/components/shared/Message";

interface BrainwritingDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティングの詳細ページコンポーネント
 *
 * 認証済みユーザーが自分のブレインライティングを管理・実行するためのページです。
 * X投稿版では、1人で複数のシートを順番に記入していくソロモードのブレインライティングを行います。
 * シート情報、入力データ、進捗状況などを表示し、ユーザーがアイデアを入力できます。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - 他ユーザーのブレインライティング: 404エラー
 *
 * ルート: /brainwritings/[id]
 *
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns ブレインライティング詳細クライアントコンポーネント、ログイン要求メッセージ、または404ページ
 */
export default async function BrainwritingDetailPage({ params }: BrainwritingDetailPageProps) {
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

  // ブレインライティング詳細取得（シート・入力データ含む）
  const brainwritingDetail = await getBrainwritingDetailById(brainwritingId, session.user.id);

  if (!brainwritingDetail) {
    notFound();
  }

  return (
    <BrainwritingDetailClient
      brainwritingDetail={brainwritingDetail}
      currentUserId={session.user.id}
    />
  );
}
