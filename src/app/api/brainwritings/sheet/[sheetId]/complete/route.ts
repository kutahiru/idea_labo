import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import {
  unlockSheet,
  rotateSheetToNextUser,
  getBrainwritingSheetWithBrainwriting,
} from "@/lib/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";

interface CompleteParams {
  params: Promise<{ sheetId: string }>;
}

// シートの完了処理（X投稿版はロック解除、チーム版は次のユーザーに交代）
export async function POST(request: NextRequest, { params }: CompleteParams) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { sheetId } = await params;
    const brainwritingSheetId = parseInt(sheetId);

    if (isNaN(brainwritingSheetId)) {
      return apiErrors.invalidId();
    }

    const data = await getBrainwritingSheetWithBrainwriting(brainwritingSheetId);
    if (!data || !data.brainwriting) {
      return NextResponse.json({ error: "シートが見つかりません" }, { status: 404 });
    }

    // チーム利用版の場合は次のユーザーに交代、X投稿版の場合はロック解除
    if (data.brainwriting.usageScope === USAGE_SCOPE.TEAM) {
      await rotateSheetToNextUser(brainwritingSheetId, authResult.userId);

      // AppSync Eventsにシートローテーションイベントを発行
      await publishBrainwritingEvent(data.brainwriting.id, BRAINWRITING_EVENT_TYPES.SHEET_ROTATED);
    } else {
      await unlockSheet(brainwritingSheetId, authResult.userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("シート完了エラー:", error);
    return apiErrors.serverError();
  }
}
