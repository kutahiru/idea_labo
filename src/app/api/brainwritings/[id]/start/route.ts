import { auth } from "@/app/lib/auth";
import { createSheetsForTeam, checkJoinStatus } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const brainwritingId = parseInt(id);

  if (isNaN(brainwritingId)) {
    return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
  }

  // 参加チェック
  const joinStatus = await checkJoinStatus(brainwritingId, session.user.id);
  if (!joinStatus.isJoined) {
    return NextResponse.json({ error: "参加していません" }, { status: 403 });
  }

  try {
    const result = await createSheetsForTeam(brainwritingId);

    // AppSync Eventsにイベントを発行
    await publishBrainwritingEvent(brainwritingId, BRAINWRITING_EVENT_TYPES.BRAINWRITING_STARTED);

    return NextResponse.json(result);
  } catch (error) {
    console.error("シート作成エラー:", error);
    return NextResponse.json({ error: "シート作成に失敗しました" }, { status: 500 });
  }
}
