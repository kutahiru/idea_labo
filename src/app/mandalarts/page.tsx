import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { getMandalartsByUserId } from "@/lib/mandalart";
import MandalartPageClient from "@/components/mandalarts/MandalartPageClient";

export const metadata: Metadata = {
  title: "マンダラート",
  description: "9×9のグリッドで目標やアイデアを整理するマンダラート手法。中心テーマから8つのサブテーマを展開し、さらに各サブテーマを深掘りしてアイデアを体系的に整理します。",
};

/**
 * マンダラート一覧ページコンポーネント
 *
 * 認証済みユーザーが作成したマンダラートの一覧を表示するページです。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 *
 * ルート: /mandalarts
 *
 * @returns マンダラート一覧クライアントコンポーネント、またはログイン要求メッセージ
 */
export default async function page() {
  const session = await auth();

  //認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const mandalarts = await getMandalartsByUserId(session.user.id);

  return <MandalartPageClient initialData={mandalarts} />;
}
