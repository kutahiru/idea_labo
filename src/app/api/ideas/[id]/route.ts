import { NextRequest, NextResponse } from "next/server";
import { updateIdea, deleteIdea, checkIdeaOwnership } from "@/lib/idea";
import { ideaFormDataSchema } from "@/schemas/idea";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

/** 更新 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: ideaId } = validateResult;

    // リクエストボディを取得・検証
    const body = await request.json();
    const { categoryId, ...formData } = body;

    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: "カテゴリIDが無効です" }, { status: 400 });
    }

    const parsedBody = ideaFormDataSchema.safeParse(formData);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // 所有者チェック
    const isOwner = await checkIdeaOwnership(ideaId, userId);
    if (!isOwner) {
      return apiErrors.notFound("アイデア");
    }

    // アイデアを更新
    const result = await updateIdea(ideaId, parseInt(categoryId), parsedBody.data);

    if (!result) {
      return apiErrors.notFound("アイデア");
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
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: ideaId } = validateResult;

    // 所有者チェック
    const isOwner = await checkIdeaOwnership(ideaId, userId);
    if (!isOwner) {
      return apiErrors.notFound("アイデア");
    }

    // アイデアを削除
    const result = await deleteIdea(ideaId);

    if (!result) {
      return apiErrors.notFound("アイデア");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("アイデア削除エラー:", error);
    return apiErrors.serverError();
  }
}
