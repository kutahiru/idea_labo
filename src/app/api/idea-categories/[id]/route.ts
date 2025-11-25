import { NextRequest, NextResponse } from "next/server";
import { updateIdeaCategory, deleteIdeaCategory } from "@/lib/idea-category";
import { ideaCategoryFormDataSchema } from "@/schemas/idea-category";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/** 更新 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidId();
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = ideaCategoryFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // アイデアカテゴリを更新
    const result = await updateIdeaCategory(id, authResult.userId, validationResult.data);

    if (!result) {
      return apiErrors.notFound("アイデアカテゴリ");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("アイデアカテゴリ更新エラー:", error);
    return apiErrors.serverError();
  }
}

/** 削除 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidId();
    }

    // アイデアカテゴリを削除
    const result = await deleteIdeaCategory(id, authResult.userId);

    if (!result) {
      return apiErrors.notFound("アイデアカテゴリ");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("アイデアカテゴリ削除エラー:", error);
    return apiErrors.serverError();
  }
}
