import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { deleteOsbornChecklist, updateOsbornChecklist } from "@/lib/osborn-checklist";
import { osbornChecklistFormDataSchema } from "@/schemas/osborn-checklist";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: osbornChecklistId } = validateResult;

    //リクエストボディを取得・検証
    const body = await request.json();
    const parsedBody = osbornChecklistFormDataSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // オズボーンを更新
    const result = await updateOsbornChecklist(osbornChecklistId, userId, parsedBody.data);

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
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: osbornChecklistId } = validateResult;

    const result = await deleteOsbornChecklist(osbornChecklistId, userId);

    if (!result) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("オズボーンのチェックリスト削除エラー:", error);
    return apiErrors.serverError();
  }
}
