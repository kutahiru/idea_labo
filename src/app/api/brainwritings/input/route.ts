import { NextRequest, NextResponse } from "next/server";
import { upsertBrainwritingInput, checkJoinStatus } from "@/lib/brainwriting";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { z } from "zod";

const inputSchema = z.object({
  brainwritingId: z.number(),
  brainwritingSheetId: z.number(),
  rowIndex: z.number(),
  columnIndex: z.number(),
  content: z.string(),
});

/**
 * ブレインライティングの入力データを保存するPOST APIエンドポイント
 *
 * ユーザーがシートのセルに入力したアイデアを保存します。
 * 既に入力データが存在する場合は更新（upsert）します。
 * 参加者のみがアクセス可能で、Zodスキーマによるバリデーションを実施します。
 *
 * エンドポイント: POST /api/brainwritings/input
 *
 * リクエストボディ:
 * ```json
 * {
 *   "brainwritingId": 123,
 *   "brainwritingSheetId": 456,
 *   "rowIndex": 0,
 *   "columnIndex": 2,
 *   "content": "新しいアイデア"
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "id": 789,
 *   "brainwriting_id": 123,
 *   "sheet_id": 456,
 *   "user_id": 1,
 *   "row_index": 0,
 *   "column_index": 2,
 *   "content": "新しいアイデア",
 *   "created_at": "2024-01-01T00:00:00Z",
 *   "updated_at": "2024-01-01T00:00:00Z"
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディに入力データを含む）
 * @returns 保存された入力データを含むJSONレスポンス、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    // リクエストボディを取得・検証
    const body = await request.json();
    const validationResult = inputSchema.safeParse(body);

    if (!validationResult.success) {
      return apiErrors.invalidData(validationResult.error.issues);
    }

    const { brainwritingId, brainwritingSheetId, rowIndex, columnIndex, content } = validationResult.data;

    // 参加チェック
    const { isJoined } = await checkJoinStatus(brainwritingId, authResult.userId);
    if (!isJoined) {
      return apiErrors.forbidden("このブレインライティングへのアクセス権限がありません");
    }

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