import { NextRequest, NextResponse } from "next/server";
import {
  getBrainwritingDetailById,
  updateBrainwriting,
  deleteBrainwriting,
} from "@/lib/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

// 個別取得
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id } = validateResult;

    // ブレインライティング詳細を取得
    const brainwritingDetail = await getBrainwritingDetailById(id, userId);

    if (!brainwritingDetail) {
      return apiErrors.notFound("ブレインライティング");
    }

    return NextResponse.json(brainwritingDetail);
  } catch (error) {
    console.error("ブレインライティング取得エラー:", error);
    return apiErrors.serverError();
  }
}

// 更新
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    // リクエストボディを取得・検証
    const body = await request.json();
    const parsedBody = brainwritingFormDataSchema.safeParse(body);

    if (!parsedBody.success) {
      return apiErrors.invalidData(parsedBody.error.issues);
    }

    // ブレインライティングを更新
    const result = await updateBrainwriting(brainwritingId, userId, parsedBody.data);

    if (!result) {
      return apiErrors.notFound("ブレインライティング");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("ブレインライティング更新エラー:", error);
    return apiErrors.serverError();
  }
}

// 削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    // ブレインライティングを削除
    const result = await deleteBrainwriting(brainwritingId, userId);

    if (!result) {
      return apiErrors.notFound("ブレインライティング");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("ブレインライティング削除エラー:", error);
    return apiErrors.serverError();
  }
}
