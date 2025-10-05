import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailById } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingDetailClient from "@/components/brainwritings/BrainwritingDetailClient";

interface BrainwritingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BrainwritingDetailPage({ params }: BrainwritingDetailPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <div className="py-8 text-center">ログインが必要です</div>;
  }

  const { id } = await params;
  const brainwritingId = parseInt(id);

  if (isNaN(brainwritingId)) {
    notFound();
  }

  // ブレインライティング詳細取得（シート・入力データ含む）
  const brainwritingDetail = await getBrainwritingDetailById(brainwritingId, session.user.id);

  if (!brainwritingDetail) {
    notFound();
  }

  return (
    <BrainwritingDetailClient
      brainwritingDetail={brainwritingDetail}
      currentUserId={session.user.id}
    />
  );
}
