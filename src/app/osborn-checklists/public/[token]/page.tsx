import { notFound } from "next/navigation";
import { getOsbornChecklistDetailByToken } from "@/lib/osborn-checklist";
import OsbornChecklistPublicClient from "@/components/osborn-checklists/OsbornChecklistPublicClient";

interface OsbornChecklistPublicPageProps {
  params: Promise<{ token: string }>;
}

/**
 * オズボーンのチェックリスト公開ページコンポーネント
 *
 * 公開トークンを使用してオズボーンのチェックリストの結果を表示するページです。
 * 認証不要でアクセス可能で、作成者が結果を公開設定にした場合に
 * URLを知っている誰でも閲覧できます。
 *
 * 表示される内容：
 * - テーマ名と説明
 * - 9つの視点（代用、組み合わせ、応用、変更、他の使い道、削除、並び替え、逆転、拡大）
 * - 各視点に対して入力されたアイデア
 * - AI生成されたアイデア（存在する場合）
 *
 * アクセス制限：
 * - 認証不要（トークンがあれば誰でもアクセス可能）
 * - 無効なトークンまたは非公開のチェックリスト: 404エラー
 *
 * ルート: /osborn-checklists/public/[token]
 *
 * @param params - ルートパラメータ（token: 公開トークン）
 * @returns オズボーンのチェックリスト公開クライアントコンポーネント、または404ページ
 */
export default async function OsbornChecklistPublicPage({ params }: OsbornChecklistPublicPageProps) {
  const { token } = await params;

  // 公開トークンでオズボーン詳細取得
  const osbornChecklistDetail = await getOsbornChecklistDetailByToken(token);

  if (!osbornChecklistDetail) {
    notFound();
  }

  return <OsbornChecklistPublicClient osbornChecklistDetail={osbornChecklistDetail} />;
}
