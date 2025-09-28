import { NextRequest, NextResponse } from "next/server";
import { upsertBrainwritingInput } from "@/lib/brainwriting";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { z } from "zod";

const inputSchema = z.object({
  brainwritingSheetId: z.number(),
  rowIndex: z.number(),
  columnIndex: z.number(),
  content: z.string(),
});

// 入力データ保存
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 認証チェック
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const brainwritingId = parseInt((await params).id);
    if (isNaN(brainwritingId)) {
      return apiErrors.invalidId();
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = inputSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    const { brainwritingSheetId, rowIndex, columnIndex, content } = validationResult.data;

    // 入力データを保存
    const result = await upsertBrainwritingInput(
      brainwritingId,
      brainwritingSheetId,
      authResult.userId,
      rowIndex,
      columnIndex,
      content
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("ブレインライティング入力保存エラー:", error);
    return apiErrors.serverError();
  }
}