import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { db } from "@/db";
import { ai_generations, osborn_checklist_inputs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";

/**
 * オズボーンのチェックリストのAI生成ステータスを取得するGET APIエンドポイント
 *
 * AI生成の進行状況と入力データの統計情報を取得します。
 * クライアント側から定期的にポーリングされ、リアルタイムで状態を更新するために使用されます。
 *
 * エンドポイント: GET /api/osborn-checklists/[id]/status
 *
 * 取得する情報：
 * - AI生成のステータス（pending, processing, completed, failed）
 * - 入力済みのアイデア数（filled）と総数（total: 9）
 *
 * レスポンス例（AI生成完了時）:
 * ```json
 * {
 *   "generation": {
 *     "id": 789,
 *     "osborn_checklist_id": 123,
 *     "generation_status": "completed",
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "updated_at": "2024-01-01T00:01:00Z"
 *   },
 *   "inputsCount": {
 *     "filled": 9,
 *     "total": 9
 *   }
 * }
 * ```
 *
 * レスポンス例（AI生成未実行時）:
 * ```json
 * {
 *   "generation": null,
 *   "inputsCount": {
 *     "filled": 0,
 *     "total": 9
 *   }
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: オズボーンのチェックリストID）
 * @returns AI生成ステータスと入力統計を含むJSONレスポンス、またはエラーレスポンス
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
      .from(ai_generations)
      .where(
        and(
          eq(ai_generations.target_type, "osborn_checklist"),
          eq(ai_generations.target_id, osbornChecklistId)
        )
      )
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
