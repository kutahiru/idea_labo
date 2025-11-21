import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { joinBrainwriting } from "@/lib/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { brainwritingId, usageScope } = await request.json();
    if (!brainwritingId || typeof brainwritingId !== "number") {
      return apiErrors.invalidId();
    }

    if (!usageScope || typeof usageScope !== "string") {
      return NextResponse.json(
        { error: "usageScopeが必要です" },
        { status: 400 }
      );
    }

    const result = await joinBrainwriting(brainwritingId, authResult.userId, usageScope);

    // AppSync Eventsにイベントを発行
    console.log(`📢 USER_JOINEDイベント発行開始 (brainwritingId: ${brainwritingId})`);
    await publishBrainwritingEvent(brainwritingId, BRAINWRITING_EVENT_TYPES.USER_JOINED);
    console.log(`✅ USER_JOINEDイベント発行完了`);

    return NextResponse.json({
      message: "参加しました",
      data: result.data,
      sheetId: result.sheetId,
    });
  } catch (error) {
    console.error("ブレインライティング参加エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
