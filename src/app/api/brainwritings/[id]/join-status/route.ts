import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import {
  checkJoinStatus,
  checkSheetLockStatus,
  checkUserCount,
  clearAbandonedSessions,
  checkTeamJoinable,
} from "@/lib/brainwriting";
import { USAGE_SCOPE } from "../../../../../utils/brainwriting";

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

    // usageScopeをクエリパラメータから取得
    const { searchParams } = new URL(request.url);
    const usageScope = searchParams.get("usageScope");

    if (!usageScope || typeof usageScope !== "string") {
      return NextResponse.json({ error: "usageScopeが必要です" }, { status: 400 });
    }

    // X投稿版の場合は各チェック前に放置されている状態をクリア
    if (usageScope === USAGE_SCOPE.XPOST) {
      await clearAbandonedSessions(brainwritingId);
    }

    const joinStatus = await checkJoinStatus(brainwritingId, authResult.userId);
    const brainwritingUserStatus = await checkUserCount(brainwritingId);

    // X投稿版の場合はロック状態も返す
    if (usageScope === USAGE_SCOPE.XPOST) {
      const lockStatus = await checkSheetLockStatus(brainwritingId, authResult.userId);

      return NextResponse.json({
        ...joinStatus,
        ...lockStatus,
        ...brainwritingUserStatus,
      });
    }

    // チーム版の場合はロック状態を返さない
    // シートが存在していて参加者に含まれていない場合は参加不可
    const teamJoinable = await checkTeamJoinable(brainwritingId, authResult.userId);

    return NextResponse.json({
      ...joinStatus,
      ...brainwritingUserStatus,
      ...teamJoinable,
    });
  } catch (error) {
    console.error("参加状況チェックエラー:", error);
    return apiErrors.serverError();
  }
}
