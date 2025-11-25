import { notFound } from "next/navigation";
import BrainwritingResultsClient from "@/components/brainwritings/BrainwritingResultsClient";
import { getBrainwritingResultsById } from "@/lib/brainwriting";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティングの結果を表示するページコンポーネント
 *
 * 指定されたIDのブレインライティングの完成した結果（全参加者の入力内容）を表示します。
 * このページは認証・権限チェックなしでアクセス可能で、URLを知っている誰でも閲覧できます。
 * ※ただし、公開されていない場合はアクセス拒否
 *
 * ルート: /brainwritings/[id]/results
 *
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns ブレインライティング結果表示クライアントコンポーネント、または404ページ
 */
export default async function BrainwritingResultsPage({ params }: PageProps) {
  const { id } = await params;
  const brainwritingId = Number(id);

  // ブレインライティング詳細を取得（権限チェックなし）
  const brainwritingDetail = await getBrainwritingResultsById(brainwritingId);

  if (!brainwritingDetail) {
    notFound();
  }

  return <BrainwritingResultsClient brainwritingDetail={brainwritingDetail} />;
}
