import { auth } from "@/app/lib/auth";
import { updateBrainwritingIsInviteActive } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { id } = await params;
  const brainwritingId = parseInt(id);

  if (isNaN(brainwritingId)) {
    return NextResponse.json({ error: "無効なIDです" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { isInviteActive } = body;

    console.log("PATCH /invite-active:", { brainwritingId, isInviteActive, userId: session.user.id });

    if (typeof isInviteActive !== "boolean") {
      return NextResponse.json({ error: "isInviteActiveはboolean型である必要があります" }, { status: 400 });
    }

    await updateBrainwritingIsInviteActive(brainwritingId, isInviteActive);
    console.log("更新成功:", { brainwritingId, isInviteActive });
    return NextResponse.json({ success: true, isInviteActive });
  } catch (error) {
    console.error("招待URLの状態更新エラー:", error);
    console.error("エラー詳細:", {
      message: error instanceof Error ? error.message : "不明なエラー",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "招待URLの状態更新に失敗しました",
        details: error instanceof Error ? error.message : "不明なエラー"
      },
      { status: 500 }
    );
  }
}
