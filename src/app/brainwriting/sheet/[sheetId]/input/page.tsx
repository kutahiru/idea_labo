import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingInputClient from "@/components/brainwriting/BrainwritingInputClient";

interface BrainwritingSheetInputPageProps {
  params: Promise<{ sheetId: string }>;
}

export default async function BrainwritingSheetInputPage({
  params,
}: BrainwritingSheetInputPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <div className="py-8 text-center">ログインが必要です</div>;
  }

  const { sheetId } = await params;
  const brainwritingSheetId = parseInt(sheetId);

  if (isNaN(brainwritingSheetId)) {
    notFound();
  }

  // シートIDからブレインライティング詳細取得
  const brainwritingDetail = await getBrainwritingDetailForBrainwritingUser(
    brainwritingSheetId,
    session.user.id
  );

  if (!brainwritingDetail) {
    notFound();
  }

  return (
    <BrainwritingInputClient
      brainwritingDetail={brainwritingDetail}
      currentUserId={session.user.id}
    />
  );
}
