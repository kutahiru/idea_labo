import { updateBrainwritingIsInviteActive } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";

/**
 * ブレインライティングの招待URL有効/無効状態を更新するPATCH APIエンドポイント
 *
 * 指定されたブレインライティングの招待リンクを有効化または無効化します。
 * 無効化することで新規参加者の受付を停止できます。
 *
 * エンドポイント: PATCH /api/brainwritings/[id]/invite-active
 *
 * リクエストボディ:
 * ```json
 * {
 *   "isInviteActive": true | false
 * }
 * ```
 *
 * レスポンス例:
 * ```json
 * {
 *   "success": true,
 *   "isInviteActive": true
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディにisInviteActiveを含む）
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
    const { isInviteActive } = body;

    if (typeof isInviteActive !== "boolean") {
      return apiErrors.invalidData("isInviteActiveはboolean型である必要があります");
    }

    await updateBrainwritingIsInviteActive(brainwritingId, userId, isInviteActive);

    return NextResponse.json({ success: true, isInviteActive });
  } catch (error) {
    console.error("招待URLの状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
