import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingCompleteContent from "@/components/brainwritings/BrainwritingCompleteContent";
import { LoginRequiredMessage } from "@/components/shared/Message";

interface BrainwritingCompletePageProps {
  params: Promise<{ sheetId: string }>;
}

/**
 * ブレインライティング（X投稿版）のシート完了ページコンポーネント
 *
 * ユーザーがシートへの入力を完了した後に表示されるページです。
 * 完了メッセージと次のアクション（新しいシートへの誘導や結果確認）を表示します。
 * 残りの参加可能人数（最大6人）も表示されます。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - 関連しないシート: 404エラー
 *
 * ルート: /brainwritings/sheet/[sheetId]/complete
 *
 * @param params - ルートパラメータ（sheetId: ブレインライティングシートID）
 * @returns ブレインライティング完了コンテンツ、ログイン要求メッセージ、または404ページ
 */
export default async function BrainwritingCompletePage({ params }: BrainwritingCompletePageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { sheetId } = await params;
  const brainwritingSheetId = parseInt(sheetId);

  if (isNaN(brainwritingSheetId)) {
    notFound();
  }

  const brainwritingDetail = await getBrainwritingDetailForBrainwritingUser(
    brainwritingSheetId,
    session.user.id
  );

  if (!brainwritingDetail) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sheets, inputs, users, ...brainwriting } = brainwritingDetail;

  return (
    <BrainwritingCompleteContent
      brainwriting={brainwriting}
      remainingUserCount={6 - users.length}
    />
  );
}
