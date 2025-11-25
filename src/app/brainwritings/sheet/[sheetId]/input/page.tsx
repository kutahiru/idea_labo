import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingInputClient from "@/components/brainwritings/BrainwritingInputClient";
import { USAGE_SCOPE, sortUsersByFirstRow } from "@/utils/brainwriting";
import { LoginRequiredMessage } from "@/components/shared/Message";

export const metadata: Metadata = {
  title: "ブレインライティング入力",
  description: "ブレインライティングのシートにアイデアを入力します",
};

interface BrainwritingSheetInputPageProps {
  params: Promise<{ sheetId: string }>;
}

/**
 * ブレインライティングのシート入力ページコンポーネント
 *
 * ユーザーがブレインライティングのシートにアイデアを入力するためのページです。
 * X投稿版とチーム版の両方で使用され、それぞれ異なる動作をします。
 *
 * X投稿版の動作：
 * - ユーザーは自分専用のシートに入力
 * - シートロック機能により、一定時間内に入力を完了する必要がある
 *
 * チーム版の動作：
 * - 複数の参加者が同時にシートに入力
 * - ユーザー一覧は最初の行の入力順でソートされる
 * - リアルタイムでシートがローテーションされる
 *
 * サーバー側で計算されたシートロックの残り時間（秒）をクライアントに渡し、
 * クライアント側でカウントダウンタイマーを表示します。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - 関連しないシート: 404エラー
 *
 * ルート: /brainwritings/sheet/[sheetId]/input
 *
 * @param params - ルートパラメータ（sheetId: ブレインライティングシートID）
 * @returns ブレインライティング入力クライアントコンポーネント、ログイン要求メッセージ、または404ページ
 */
export default async function BrainwritingSheetInputPage({
  params,
}: BrainwritingSheetInputPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { sheetId } = await params;
  const brainwritingSheetId = parseInt(sheetId);

  if (isNaN(brainwritingSheetId)) {
    notFound();
  }

  // シートIDからブレインライティング詳細取得
  const brainwritingDetail = await getBrainwritingDetailForBrainwritingUser(
    brainwritingSheetId,
    session.user.id
  );

  if (!brainwritingDetail) {
    notFound();
  }

  if (brainwritingDetail.usageScope === USAGE_SCOPE.TEAM) {
    // チーム利用版の場合、並び替え
    brainwritingDetail.users = sortUsersByFirstRow(
      brainwritingDetail.inputs,
      brainwritingDetail.users
    );
  }

  // サーバー時刻で残り時間を計算（秒単位）
  let initialSecondsLeft: number | null = null;
  const sheet = brainwritingDetail.sheets[0];
  if (sheet?.lock_expires_at) {
    const now = new Date();
    const expiresAt = new Date(sheet.lock_expires_at);
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    initialSecondsLeft = Math.floor(timeLeftMs / 1000);
  }

  return (
    <BrainwritingInputClient
      brainwritingDetail={brainwritingDetail}
      currentUserId={session.user.id}
      initialSecondsLeft={initialSecondsLeft}
    />
  );
}
