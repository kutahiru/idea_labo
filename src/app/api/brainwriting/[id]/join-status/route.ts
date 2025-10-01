import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import {
  checkJoinStatus,
  checkSheetLockStatus,
  checkUserCount,
  clearAbandonedSessions,
} from "@/lib/brainwriting";

interface JoinStatusParams {
  params: Promise<{ id: string }>;
}

// 放置されている状態のクリアと参加状況のチェック
export async function GET(request: NextRequest, { params }: JoinStatusParams) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const brainwritingId = parseInt(id);

    if (isNaN(brainwritingId)) {
      return apiErrors.invalidId();
    }

    // 各チェック前に参加して放置されている状態がある場合クリアする
    await clearAbandonedSessions(brainwritingId);

    const joinStatus = await checkJoinStatus(brainwritingId, authResult.userId);
    const lockStatus = await checkSheetLockStatus(brainwritingId, authResult.userId);
    const brainwritingUserStatus = await checkUserCount(brainwritingId);

    return NextResponse.json({
      ...joinStatus,
      ...lockStatus,
      ...brainwritingUserStatus,
    });
  } catch (error) {
    console.error("参加状況チェックエラー:", error);
    return apiErrors.serverError();
  }
}
