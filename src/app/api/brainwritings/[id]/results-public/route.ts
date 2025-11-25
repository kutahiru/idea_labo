import { updateBrainwritingIsResultsPublic } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

/**
 * ブレインライティングの結果公開状態を更新するPATCH APIエンドポイント
 *
 * 指定されたブレインライティングの結果を公開または非公開に設定します。
 * 公開すると、ログインしていない外部ユーザーも結果を閲覧可能になります。
 *
 * エンドポイント: PATCH /api/brainwritings/[id]/results-public
 *
 * リクエストボディ:
 * ```json
 * {
 *   "isResultsPublic": true | false
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "success": true,
 *   "isResultsPublic": true
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディにisResultsPublicを含む）
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns 更新結果を含むJSONレスポンス、またはエラーレスポンス
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    const body = await request.json();
    const { isResultsPublic } = body;

    if (typeof isResultsPublic !== "boolean") {
      return apiErrors.invalidData("isResultsPublicはboolean型である必要があります");
    }

    await updateBrainwritingIsResultsPublic(brainwritingId, userId, isResultsPublic);

    return NextResponse.json({ success: true, isResultsPublic });
  } catch (error) {
    console.error("結果公開の状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
