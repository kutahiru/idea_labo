import type { Metadata } from "next";
import IdeaCategoryPageClient from "@/components/idea-categories/IdeaCategoryPageClient";
import { auth } from "@/app/lib/auth";
import { getIdeaCategoriesByUserId } from "@/lib/idea-category";
import { LoginRequiredMessage } from "@/components/shared/Message";

export const metadata: Metadata = {
  title: "アイデアカテゴリ",
  description: "アイデアをカテゴリごとに整理・管理。ブレインライティング、マンダラート、オズボーンのチェックリストで発想したアイデアを保存できます。",
};

/**
 * アイデアカテゴリ一覧ページコンポーネント
 *
 * 認証済みユーザーが作成したアイデアカテゴリの一覧を表示するページです。
 * ユーザーはカテゴリを作成・編集・削除でき、各カテゴリに分類されたアイデアを管理できます。
 * ブレインライティング、マンダラート、オズボーンのチェックリストなどで生成されたアイデアを
 * カテゴリごとに整理・保存するための機能を提供します。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 *
 * ルート: /idea-categories
 *
 * @returns アイデアカテゴリ一覧クライアントコンポーネント、またはログイン要求メッセージ
 */
export default async function IdeaCategoryPage() {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const ideaCategories = await getIdeaCategoriesByUserId(session.user.id);

  return (
    <div>
      <div className="mt-6 mb-4 text-center">
        <h1 className="text-primary text-3xl font-bold">アイデアカテゴリ</h1>
      </div>
      <IdeaCategoryPageClient initialData={ideaCategories} />
    </div>
  );
}
