import { auth } from "@/app/lib/auth";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { getOsbornChecklistsByUserId } from "@/lib/osborn-checklist";
import OsbornChecklistPageClient from "@/components/osborn-checklists/OsbornChecklistPageClient";

/**
 * オズボーンのチェックリスト一覧ページコンポーネント
 *
 * 認証済みユーザーが作成したオズボーンのチェックリストの一覧を表示するページです。
 * ユーザーは新規作成、編集、削除、実行などのアクションを実行できます。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 *
 * ルート: /osborn-checklists
 *
 * @returns オズボーンのチェックリスト一覧クライアントコンポーネント、またはログイン要求メッセージ
 */
export default async function OsbornChecklistsPage() {
  const session = await auth();

  //認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const osbornChecklists = await getOsbornChecklistsByUserId(session.user.id);

  return <OsbornChecklistPageClient initialData={osbornChecklists} />;
}
