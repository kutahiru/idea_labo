import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingsByUserId, createBrainwriting } from "@/lib/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { checkAuth } from "@/lib/api/utils";

// 一覧取得
export async function GET() {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const brainwritingList = await getBrainwritingsByUserId(authResult.userId);

    return NextResponse.json(brainwritingList);
  } catch (error) {
    console.error("ブレインライティング一覧取得エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

// 新規作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = brainwritingFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // ブレインライティングを作成
    const result = await createBrainwriting(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("ブレインライティング作成エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
