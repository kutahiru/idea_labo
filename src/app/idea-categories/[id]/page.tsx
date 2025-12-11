import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { getIdeasByCategoryId } from "@/lib/idea";
import { getCategoryById } from "@/lib/idea-category";
import IdeaPageClient from "@/components/ideas/IdeaPageClient";
import { LoginRequiredMessage } from "@/components/shared/Message";

export const metadata: Metadata = {
  title: "アイデア一覧",
  description: "カテゴリに分類されたアイデアの一覧",
};

/**
 * アイデアカテゴリ詳細ページコンポーネント
 *
 * 指定されたカテゴリに属するアイデア一覧を表示するページです。
 * カテゴリの所有者のみがアクセスでき、アイデアの作成、編集、削除などの操作が可能です。
 * ブレインライティング、マンダラート、オズボーンのチェックリストなどから
 * 保存されたアイデアがこのカテゴリに分類されます。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - カテゴリの所有者でないユーザー: エラーメッセージを表示
 *
 * ルート: /idea-categories/[id]
 *
 * @param params - ルートパラメータ（id: アイデアカテゴリID）
 * @returns アイデア一覧クライアントコンポーネント、ログイン要求メッセージ、またはエラーメッセージ
 */
export default async function IdeaCategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { id } = await params;
  const categoryId = parseInt(id);

  if (isNaN(categoryId)) {
    return <div className="py-8 text-center">カテゴリが見つかりません</div>;
  }

  // カテゴリ情報取得（所有者確認含む）
  const category = await getCategoryById(categoryId, session.user.id);
  if (!category) {
    return <div className="py-8 text-center">カテゴリが見つかりません</div>;
  }

  const ideas = await getIdeasByCategoryId(categoryId, session.user.id);

  return <IdeaPageClient initialData={ideas} categoryId={categoryId} categoryName={category.name} />;
}
