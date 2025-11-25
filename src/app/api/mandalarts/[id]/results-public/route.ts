import { updateMandalartIsResultsPublic } from "@/lib/mandalart";
import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/**
 * マンダラートの結果公開状態を更新するPATCH APIエンドポイント
 *
 * 指定されたマンダラートの結果を公開または非公開に設定します。
 * 公開すると、ログインしていない外部ユーザーも結果を閲覧可能になります。
 *
 * エンドポイント: PATCH /api/mandalarts/[id]/results-public
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
 * @param params - ルートパラメータ（id: マンダラートID）
 * @returns 更新結果を含むJSONレスポンス、またはエラーレスポンス
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { id } = await params;
    const mandalartId = parseInt(id);

    if (isNaN(mandalartId)) {
      return apiErrors.invalidId();
    }

    const body = await request.json();
    const { isResultsPublic } = body;

    if (typeof isResultsPublic !== "boolean") {
      return apiErrors.invalidData("isResultsPublicはboolean型である必要があります");
    }

    await updateMandalartIsResultsPublic(mandalartId, authResult.userId, isResultsPublic);

    return NextResponse.json({ success: true, isResultsPublic });
  } catch (error) {
    console.error("結果公開の状態更新エラー:", error);
    return apiErrors.serverError();
  }
}
