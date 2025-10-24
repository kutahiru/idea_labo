import { auth } from "@/app/lib/auth";
import { updateBrainwritingIsResultsPublic } from "@/lib/brainwriting";
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
    const { isResultsPublic } = body;

    console.log("PATCH /results-public:", { brainwritingId, isResultsPublic, userId: session.user.id });

    if (typeof isResultsPublic !== "boolean") {
      return NextResponse.json({ error: "isResultsPublicはboolean型である必要があります" }, { status: 400 });
    }

    await updateBrainwritingIsResultsPublic(brainwritingId, session.user.id, isResultsPublic);
    console.log("更新成功:", { brainwritingId, isResultsPublic });
    return NextResponse.json({ success: true, isResultsPublic });
  } catch (error) {
    console.error("結果公開の状態更新エラー:", error);
    console.error("エラー詳細:", {
      message: error instanceof Error ? error.message : "不明なエラー",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "結果公開の状態更新に失敗しました",
        details: error instanceof Error ? error.message : "不明なエラー"
      },
      { status: 500 }
    );
  }
}
