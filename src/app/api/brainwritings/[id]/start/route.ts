import { createSheetsForTeam, checkJoinStatus } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";
import { checkAuth, apiErrors } from "@/lib/api/utils";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const brainwritingId = parseInt(id);

    if (isNaN(brainwritingId)) {
      return apiErrors.invalidId();
    }

    // 参加チェック
    const joinStatus = await checkJoinStatus(brainwritingId, authResult.userId);
    if (!joinStatus.isJoined) {
      return apiErrors.forbidden("参加していません");
    }

    const result = await createSheetsForTeam(brainwritingId);

    // AppSync Eventsにイベントを発行
    await publishBrainwritingEvent(brainwritingId, BRAINWRITING_EVENT_TYPES.BRAINWRITING_STARTED);

    return NextResponse.json(result);
  } catch (error) {
    console.error("シート作成エラー:", error);
    return apiErrors.serverError();
  }
}
