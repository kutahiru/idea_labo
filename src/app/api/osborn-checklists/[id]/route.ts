import { NextRequest, NextResponse } from "next/server";
import { apiErrors, checkAuth } from "@/lib/api/utils";
import { deleteOsbornChecklist, updateOsbornChecklist } from "@/lib/osborn-checklist";
import { osbornChecklistFormDataSchema } from "@/schemas/osborn-checklist";

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

    //リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = osbornChecklistFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // オズボーンを更新
    const result = await updateOsbornChecklist(id, authResult.userId, validationResult.data);

    if (!result) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("オズボーンのチェックリスト更新エラー:", error);
    return apiErrors.serverError();
  }
}

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

    const result = await deleteOsbornChecklist(id, authResult.userId);

    if (!result) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("オズボーンのチェックリスト削除エラー:", error);
    return apiErrors.serverError();
  }
}
