import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingInputsBySheetId } from "@/lib/brainwriting";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

/**
 * 指定されたシートの入力データを取得するGET APIエンドポイント
 *
 * ブレインライティングの特定のシートに紐づく全ての入力データを取得します。
 * シート表示画面で、そのシートに記入されたアイデアを表示するために使用されます。
 *
 * エンドポイント: GET /api/brainwritings/sheets/[id]/inputs
 *
 * レスポンス例:
 * ```json
 * [
 *   {
 *     "id": 1,
 *     "brainwriting_id": 123,
 *     "sheet_id": 456,
 *     "user_id": "user-123",
 *     "row_index": 0,
 *     "column_index": 0,
 *     "content": "アイデア内容",
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "updated_at": "2024-01-01T00:00:00Z"
 *   }
 * ]
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: ブレインライティングシートID）
 * @returns シートの入力データ配列を含むJSONレスポンス、またはエラーレスポンス
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

    const { id: sheetId } = validateResult;

    const inputs = await getBrainwritingInputsBySheetId(sheetId);
    return NextResponse.json(inputs);
  } catch (error) {
    console.error("シート入力取得エラー:", error);
    return apiErrors.serverError();
  }
}
