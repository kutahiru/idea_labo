import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingInputClient from "@/components/brainwritings/BrainwritingInputClient";

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

  // サーバー時刻で残り時間を計算（秒単位）
  let initialSecondsLeft: number | null = null;
  const sheet = brainwritingDetail.sheets[0];
  if (sheet?.lock_expires_at) {
    const now = new Date();
    const expiresAt = new Date(sheet.lock_expires_at);
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    initialSecondsLeft = Math.floor(timeLeftMs / 1000);
  }

  return (
    <BrainwritingInputClient
      brainwritingDetail={brainwritingDetail}
      currentUserId={session.user.id}
      initialSecondsLeft={initialSecondsLeft}
    />
  );
}
