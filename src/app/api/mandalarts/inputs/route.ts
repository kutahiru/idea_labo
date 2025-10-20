import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { upsertMandalartInput } from "@/lib/mandalart";
import { mandalartInputSchema } from "@/schemas/mandalart";

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const body = await request.json();

    // Zodスキーマでバリデーション
    const validationResult = mandalartInputSchema.safeParse(body);
    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues[0].message);
    }

    const { mandalartId, sectionRowIndex, sectionColumnIndex, rowIndex, columnIndex, content } =
      validationResult.data;

    const result = await upsertMandalartInput(
      mandalartId,
      authResult.userId,
      sectionRowIndex,
      sectionColumnIndex,
      rowIndex,
      columnIndex,
      content
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("マンダラート入力保存エラー:", error);

    // アクセス拒否エラーのハンドリング
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return apiErrors.forbidden();
    }

    return apiErrors.serverError();
  }
}
