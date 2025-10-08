import { auth } from "@/app/lib/auth";
import { getBrainwritingDetailForBrainwritingUser } from "@/lib/brainwriting";
import { notFound } from "next/navigation";
import BrainwritingInputClient from "@/components/brainwritings/BrainwritingInputClient";
import { USAGE_SCOPE, sortUsersByFirstRow } from "@/utils/brainwriting";
import { LoginRequiredMessage } from "@/components/shared/Message";

interface BrainwritingSheetInputPageProps {
  params: Promise<{ sheetId: string }>;
}

export default async function BrainwritingSheetInputPage({
  params,
}: BrainwritingSheetInputPageProps) {
  const session = await auth();

  // 認証チェック
  if (!session?.user?.id) {
    return <LoginRequiredMessage />;
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

  if (brainwritingDetail.usageScope === USAGE_SCOPE.TEAM) {
    // チーム利用版の場合、並び替え
    brainwritingDetail.users = sortUsersByFirstRow(
      brainwritingDetail.inputs,
      brainwritingDetail.users
    );
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
