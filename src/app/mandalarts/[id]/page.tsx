import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { auth } from "@/app/lib/auth";
import { getMandalartDetailById } from "@/lib/mandalart";
import MandalartDetailClient from "@/components/mandalarts/MandalartDetailClient";

interface MandalartDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "マンダラート",
  description: "9×9のグリッドでアイデアを整理するマンダラート",
};

/**
 * マンダラート詳細ページコンポーネント
 *
 * 認証済みユーザーが自分のマンダラートを管理・実行するためのページです。
 *
 * 入力データを含むマンダラート情報を取得し、クライアント側で
 * ビジュアルなグリッド表示とアイデア入力機能を提供します。
 *
 * アクセス制限：
 * - 未ログインユーザー: ログイン要求メッセージを表示
 * - 他ユーザーのマンダラート: 404エラー
 *
 * ルート: /mandalarts/[id]
 *
 * @param params - ルートパラメータ（id: マンダラートID）
 * @returns マンダラート詳細クライアントコンポーネント、ログイン要求メッセージ、または404ページ
 */
export default async function MandalartDetailPage({ params }: MandalartDetailPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
  }

  const { id } = await params;
  const mandalartId = parseInt(id);

  if (isNaN(mandalartId)) {
    notFound();
  }

  //マンダラート詳細取得(入力データ含む)
  const mandalartDetail = await getMandalartDetailById(mandalartId, session.user.id);

  if (!mandalartDetail) {
    notFound();
  }

  return <MandalartDetailClient mandalartDetail={mandalartDetail} />;
}
