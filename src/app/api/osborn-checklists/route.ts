import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/api/utils";
import { osbornChecklistFormDataSchema } from "@/schemas/osborn-checklist";
import { createOsbornChecklist } from "@/lib/osborn-checklist";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = osbornChecklistFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const result = await createOsbornChecklist(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("オズボーンのチェックリスト作成エラー", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
