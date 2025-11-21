import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { db } from "@/db";
import { osborn_ai_generations, osborn_checklist_inputs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";

/**
 * オズボーンのチェックリストのAI生成ステータスを取得
 * ポーリング用のエンドポイント
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { id: osbornChecklistId } = validateResult;

    // AI生成ステータスを取得
    const [generation] = await db
      .select()
      .from(osborn_ai_generations)
      .where(eq(osborn_ai_generations.osborn_checklist_id, osbornChecklistId))
      .limit(1);

    // 入力データも取得（完了時に表示するため）
    const inputs = await db
      .select()
      .from(osborn_checklist_inputs)
      .where(eq(osborn_checklist_inputs.osborn_checklist_id, osbornChecklistId));

    // 入力数をカウント
    const filledCount = inputs.filter((input) => input.content && input.content.trim() !== "")
      .length;
    const totalCount = Object.keys(OSBORN_CHECKLIST_TYPES).length;

    return NextResponse.json({
      generation: generation || null,
      inputsCount: {
        filled: filledCount,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("ステータス取得エラー:", error);
    return apiErrors.serverError();
  }
}
