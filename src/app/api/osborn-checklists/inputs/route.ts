import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/api/utils";
import { upsertOsbornChecklistInput } from "@/lib/osborn-checklist";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得
    const body = await request.json();
    const { osbornChecklistId, checklistType, content } = body;

    // バリデーション
    if (!osbornChecklistId || typeof osbornChecklistId !== "number") {
      return NextResponse.json({ error: "オズボーンのチェックリストIDが無効です" }, { status: 400 });
    }

    if (!checklistType || !Object.values(OSBORN_CHECKLIST_TYPES).includes(checklistType)) {
      return NextResponse.json({ error: "チェックリストタイプが無効です" }, { status: 400 });
    }

    // 入力データを保存
    const result = await upsertOsbornChecklistInput(
      osbornChecklistId,
      authResult.userId,
      checklistType,
      content || ""
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("オズボーンのチェックリスト入力保存エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
