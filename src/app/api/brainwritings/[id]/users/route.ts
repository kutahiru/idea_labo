import { NextRequest, NextResponse } from "next/server";
import { getBrainwritingUsersByBrainwritingId } from "@/lib/brainwriting";
import { checkAuth, apiErrors } from "@/lib/api/utils";

/**
 * ブレインライティングの参加者一覧を取得するGET APIエンドポイント
 *
 * 指定されたブレインライティングIDに紐づく全ての参加者情報を取得します。
 * リアルタイム更新機能（useBrainwritingRealtime）から呼び出され、
 * 新規参加者が追加された際に参加者一覧を更新するために使用されます。
 *
 * エンドポイント: GET /api/brainwritings/[id]/users
 *
 * レスポンス例:
 * ```json
 * {
 *   "users": [
 *     {
 *       "id": 1,
 *       "brainwriting_id": 123,
 *       "user_id": 10,
 *       "user_name": "田中太郎",
 *       "joined_at": "2024-01-01T00:00:00Z"
 *     }
 *   ]
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns 参加者一覧を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return apiErrors.invalidId();
    }

    // 参加者一覧を取得
    const users = await getBrainwritingUsersByBrainwritingId(id);

    return NextResponse.json({ users });
  } catch (error) {
    console.error("参加者一覧取得エラー:", error);
    return apiErrors.serverError();
  }
}
