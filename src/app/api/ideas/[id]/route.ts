import { NextRequest, NextResponse } from "next/server";
import { updateIdea, deleteIdea, checkIdeaOwnership } from "@/lib/idea";
import { ideaFormDataSchema } from "@/schemas/idea";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/** 更新 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
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
    const { categoryId, ...formData } = body;

    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: "カテゴリIDが無効です" }, { status: 400 });
    }

    const validationResult = ideaFormDataSchema.safeParse(formData);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // 所有者チェック
    const isOwner = await checkIdeaOwnership(id, authResult.userId);
    if (!isOwner) {
      return apiErrors.notFound();
    }

    // アイデアを更新
    const result = await updateIdea(id, parseInt(categoryId), validationResult.data);

    if (!result) {
      return apiErrors.notFound();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("アイデア更新エラー:", error);
    return apiErrors.serverError();
  }
}

/** 削除 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidId();
    }

    // 所有者チェック
    const isOwner = await checkIdeaOwnership(id, authResult.userId);
    if (!isOwner) {
      return apiErrors.notFound();
    }

    // アイデアを削除
    const result = await deleteIdea(id);

    if (!result) {
      return apiErrors.notFound();
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("アイデア削除エラー:", error);
    return apiErrors.serverError();
  }
}
