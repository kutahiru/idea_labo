import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMandalartDetailByToken } from "@/lib/mandalart";
import MandalartPublicClient from "@/components/mandalarts/MandalartPublicClient";

interface MandalartPublicPageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: "マンダラート",
  description: "9×9のグリッドでアイデアを整理するマンダラート",
};

/**
 * マンダラート公開ページコンポーネント
 *
 * 公開トークンを使用してマンダラートの結果を表示するページです。
 * 認証不要でアクセス可能で、マンダラートの作成者が結果を公開設定にした場合に
 * URLを知っている誰でも閲覧できます。
 *
 * 9×9のグリッド構造で、中心のテーマから派生したサブテーマとアイデアを
 * 視覚的に確認できます。入力済みのセルのみが表示されます。
 *
 * アクセス制限：
 * - 認証不要（トークンがあれば誰でもアクセス可能）
 * - 無効なトークンまたは非公開のマンダラート: 404エラー
 *
 * ルート: /mandalarts/public/[token]
 *
 * @param params - ルートパラメータ（token: 公開トークン）
 * @returns マンダラート公開クライアントコンポーネント、または404ページ
 */
export default async function MandalartPublicPage({ params }: MandalartPublicPageProps) {
  const { token } = await params;

  // 公開トークンでマンダラート詳細取得
  const mandalartDetail = await getMandalartDetailByToken(token);

  if (!mandalartDetail) {
    notFound();
  }

  return <MandalartPublicClient mandalartDetail={mandalartDetail} />;
}
