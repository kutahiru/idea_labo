import { NextRequest, NextResponse } from "next/server";
import { apiErrors, checkAuth } from "@/lib/api/utils";
import { deleteMandalart, getMandalartDetailById, updateMandalart } from "@/lib/mandalart";
import { mandalartFormDataSchema } from "@/schemas/mandalart";

// 個別取得
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidData();
    }

    const mandalartDetail = await getMandalartDetailById(id, authResult.userId);

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
    const validationResult = mandalartFormDataSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    // マンダラートを更新
    const result = await updateMandalart(id, authResult.userId, validationResult.data);

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
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidId();
    }

    const result = await deleteMandalart(id, authResult.userId);

    if (!result) {
      return apiErrors.notFound("マンダラート");
    }

    return NextResponse.json({ message: "削除が完了しました", id: result.id });
  } catch (error) {
    console.error("マンダラート削除エラー:", error);
    return apiErrors.serverError();
  }
}
