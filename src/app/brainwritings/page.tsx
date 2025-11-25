import BrainwritingPageClient from "@/components/brainwritings/BrainwritingPageClient";
import { auth } from "@/app/lib/auth";
import { getBrainwritingsByUserId } from "@/lib/brainwriting";
import { LoginRequiredMessage } from "@/components/shared/Message";

/**
 * ブレインライティング一覧ページコンポーネント
 *
 * 認証済みユーザーが作成したブレインライティングの一覧を表示するページです。
 * X投稿版とチーム版の両方のブレインライティングが表示され、
 * ユーザーは新規作成、編集、削除、実行などのアクションを実行できます。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 *
 * ルート: /brainwritings
 *
 * @returns ブレインライティング一覧クライアントコンポーネント、またはログイン要求メッセージ
 */
export default async function BrainwritingPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const brainwritings = await getBrainwritingsByUserId(session.user.id);

  return <BrainwritingPageClient initialData={brainwritings} />;
}
