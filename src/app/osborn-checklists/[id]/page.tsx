import { notFound } from "next/navigation";
import { LoginRequiredMessage } from "@/components/shared/Message";
import { auth } from "@/app/lib/auth";
import { getOsbornChecklistDetailById } from "@/lib/osborn-checklist";
import OsbornChecklistDetailClient from "@/components/osborn-checklists/OsbornChecklistDetailClient";

interface OsbornChecklistDetailPageProps {
  params: Promise<{ id: string }>;
}

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

  return (
    <OsbornChecklistDetailClient
      osbornChecklistDetail={OsbornChecklistDetail}
    />
  );
}
