import { NextRequest, NextResponse } from "next/server";
import { createIdea } from "@/lib/idea";
import { checkCategoryOwnership } from "@/lib/idea-category";
import { ideaFormDataSchema } from "@/schemas/idea";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/** 新規作成 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const { categoryId, ...formData } = body;

    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: "カテゴリIDが無効です" }, { status: 400 });
    }

    // カテゴリの所有者確認
    const isOwner = await checkCategoryOwnership(parseInt(categoryId), authResult.userId);
    if (!isOwner) {
      return apiErrors.notFound("アイデア");
    }

    const validationResult = ideaFormDataSchema.safeParse(formData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // アイデアを作成
    const result = await createIdea(parseInt(categoryId), validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("アイデア作成エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
