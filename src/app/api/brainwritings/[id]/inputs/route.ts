import { NextResponse } from "next/server";
import { validateIdRequest, apiErrors } from "@/lib/api/utils";
import { getBrainwritingInputsByBrainwritingId } from "@/lib/brainwriting";

interface InputsParams {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティングの入力データ一覧を取得するGET APIエンドポイント
 *
 * 指定されたブレインライティングIDに紐づく全ての入力データを取得します。
 * リアルタイム更新機能（useBrainwritingRealtime）から呼び出されることを想定しています。
 *
 * エンドポイント: GET /api/brainwritings/[id]/inputs
 *
 * レスポンス例:
 * ```json
 * {
 *   "inputs": [
 *     {
 *       "id": 1,
 *       "brainwriting_id": 123,
 *       "sheet_id": 1,
 *       "user_id": 1,
 *       "content": "アイデア内容",
 *       "created_at": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns 入力データ一覧を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET(request: Request, { params }: InputsParams) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { id: brainwritingId } = validateResult;

    const inputs = await getBrainwritingInputsByBrainwritingId(brainwritingId);

    return NextResponse.json({ inputs });
  } catch (error) {
    console.error("入力データ取得エラー:", error);
    return apiErrors.serverError();
  }
}
