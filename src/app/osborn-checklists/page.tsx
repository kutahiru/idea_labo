import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { getOsbornChecklistsByUserId } from "@/lib/osborn-checklist";
import OsbornChecklistPageClient from "@/components/osborn-checklists/OsbornChecklistPageClient";

export const metadata: Metadata = {
  title: "オズボーンのチェックリスト",
  description: "9つの視点（代用・組み合わせ・応用・変更・他の使い道・削除・並び替え・逆転・拡大）から既存のアイデアを発展させるオズボーンのチェックリスト",
};

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
