import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { auth } from "@/app/lib/auth";
import { getOsbornChecklistDetailById } from "@/lib/osborn-checklist";
import OsbornChecklistDetailClient from "@/components/osborn-checklists/OsbornChecklistDetailClient";

export const metadata: Metadata = {
  title: "オズボーンのチェックリスト",
  description: "9つの視点からアイデアを発展させるオズボーンのチェックリスト",
};

interface OsbornChecklistDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * オズボーンのチェックリスト詳細ページコンポーネント
 *
 * 認証済みユーザーが自分のオズボーンのチェックリストを管理・実行するためのページです。
 *
 * 主な機能：
 * - 9つの各視点に対するアイデア入力
 * - AI機能による自動アイデア生成（OpenAI API使用）
 * - 入力済みアイデアの編集・削除
 * - 結果の公開設定
 *
 * 入力データを含むオズボーンのチェックリスト情報を取得し、クライアント側で
 * 各視点のアイデア入力とAI生成機能を提供します。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - 他ユーザーのチェックリスト: 404エラー
 *
 * ルート: /osborn-checklists/[id]
 *
 * @param params - ルートパラメータ（id: オズボーンのチェックリストID）
 * @returns オズボーンのチェックリスト詳細クライアントコンポーネント、ログイン要求メッセージ、または404ページ
 */
export default async function OsbornChecklistDetailPage({
  params,
}: OsbornChecklistDetailPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { id } = await params;
  const OsbornId = parseInt(id);

  if (isNaN(OsbornId)) {
    notFound();
  }

  //オズボーンのチェックリストの詳細取得(入力データ含む)
  const OsbornChecklistDetail = await getOsbornChecklistDetailById(OsbornId, session.user.id);

  if (!OsbornChecklistDetail) {
    notFound();
  }

  return <OsbornChecklistDetailClient osbornChecklistDetail={OsbornChecklistDetail} />;
}
