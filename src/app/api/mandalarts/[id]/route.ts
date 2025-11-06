import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { deleteMandalart, getMandalartDetailById, updateMandalart } from "@/lib/mandalart";
import { mandalartFormDataSchema } from "@/schemas/mandalart";

// 個別取得
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: mandalartId } = validateResult;

    const mandalartDetail = await getMandalartDetailById(mandalartId, userId);

    if (!mandalartDetail) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json(mandalartDetail);
  } catch (error) {
    console.log("マンダラート取得エラー", error);
    return apiErrors.serverError();
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: mandalartId } = validateResult;

    //リクエストボディを取得・検証
    const body = await request.json();
    const parsedBody = mandalartFormDataSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // マンダラートを更新
    const result = await updateMandalart(mandalartId, userId, parsedBody.data);

    if (!result) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("マンダラート更新エラー:", error);
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

    const { userId, id: mandalartId } = validateResult;

    const result = await deleteMandalart(mandalartId, userId);

    if (!result) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("マンダラート削除エラー:", error);
    return apiErrors.serverError();
  }
}
