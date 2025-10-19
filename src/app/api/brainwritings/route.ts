import { NextRequest, NextResponse } from "next/server";
import { createBrainwriting } from "@/lib/brainwriting";
import { brainwritingFormDataSchema } from "@/schemas/brainwriting";
import { apiErrors, checkAuth } from "@/lib/api/utils";

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
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // ブレインライティングを作成
    const result = await createBrainwriting(authResult.userId, validationResult.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("ブレインライティング作成エラー:", error);
    return apiErrors.serverError();
  }
}
