import { NextRequest, NextResponse } from "next/server";
import { getIdeaCategoriesByUserId, createIdeaCategory } from "@/lib/idea-category";
import { ideaCategoryFormDataSchema } from "@/schemas/idea-category";
import { checkAuth } from "@/lib/api/utils";

/** 一覧取得 */
export async function GET() {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const ideaCategoryList = await getIdeaCategoriesByUserId(authResult.userId);

    return NextResponse.json(ideaCategoryList);
  } catch (error) {
    console.error("アイデアカテゴリ一覧取得エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

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
    const validationResult = ideaCategoryFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "入力データが無効です",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // アイデアカテゴリを作成
    const result = await createIdeaCategory(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("アイデアカテゴリ作成エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
