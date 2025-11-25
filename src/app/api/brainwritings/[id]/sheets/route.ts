import { NextResponse } from "next/server";
import { validateIdRequest, apiErrors } from "@/lib/api/utils";
import { getBrainwritingSheetsByBrainwritingId } from "@/lib/brainwriting";

interface SheetsParams {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティングのシート情報一覧を取得するGET APIエンドポイント
 *
 * 指定されたブレインライティングIDに紐づく全てのシート情報を取得します。
 * リアルタイム更新機能（useBrainwritingRealtime）から呼び出され、
 * 各シートの現在の担当者や完了状態を確認するために使用されます。
 *
 * エンドポイント: GET /api/brainwritings/[id]/sheets
 *
 * レスポンス例:
 * ```json
 * {
 *   "sheets": [
 *     {
 *       "id": 1,
 *       "brainwriting_id": 123,
 *       "sheet_number": 1,
 *       "original_user_id": 1,
 *       "current_user_id": 2,
 *       "created_at": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns シート情報一覧を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET(request: Request, { params }: SheetsParams) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { id: brainwritingId } = validateResult;

    const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);

    return NextResponse.json({ sheets });
  } catch (error) {
    console.error("シート情報取得エラー:", error);
    return apiErrors.serverError();
  }
}
