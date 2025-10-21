import { notFound } from "next/navigation";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { auth } from "@/app/lib/auth";
import { getMandalartDetailById } from "@/lib/mandalart";
import MandalartDetailClient from "@/components/mandalarts/MandalartDetailClient";

interface MandalartDetailPageProps {
  params: Promise<{ id: string }>;
}

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

  return (
    <MandalartDetailClient mandalartDetail={mandalartDetail} currentUserId={session.user.id} />
  );
}
