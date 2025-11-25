import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import {
  checkJoinStatus,
  checkSheetLockStatus,
  checkUserCount,
  clearAbandonedSessions,
  checkTeamJoinable,
} from "@/lib/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

interface JoinStatusParams {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティングの参加状況を取得するGET APIエンドポイント
 *
 * 招待ページから定期的にポーリングされ、参加可否やロック状態を返します。
 * usageScope（X投稿版/チーム版）によって動作が異なります。
 *
 * エンドポイント: GET /api/brainwritings/[id]/join-status?usageScope=xpost|team
 *
 * X投稿版の場合：
 * - 放置されたセッションを自動クリア
 * - シートのロック状態を含めて返却
 *
 * チーム版の場合：
 * - シート作成済みで参加者リストに含まれていない場合は参加不可
 * - ロック状態は返却しない
 *
 * レスポンス例（X投稿版）:
 * ```json
 * {
 *   "isJoined": false,
 *   "isLocked": false,
 *   "participantCount": 2,
 *   "isFull": false
 * }
 * ```
 *
 * レスポンス例（チーム版）:
 * ```json
 * {
 *   "isJoined": false,
 *   "participantCount": 2,
 *   "isFull": false,
 *   "canJoin": true
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（クエリパラメータにusageScopeを含む）
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns 参加状況とロック状態を含むJSONレスポンス、またはエラーレスポンス
 */
export async function GET(request: NextRequest, { params }: JoinStatusParams) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    // usageScopeをクエリパラメータから取得
    const { searchParams } = new URL(request.url);
    const usageScope = searchParams.get("usageScope");

    if (!usageScope || typeof usageScope !== "string") {
      return NextResponse.json({ error: "usageScopeが必要です" }, { status: 400 });
    }

    // X投稿版の場合は各チェック前に放置されている状態をクリア
    if (usageScope === USAGE_SCOPE.XPOST) {
      await clearAbandonedSessions(brainwritingId);
    }

    const joinStatus = await checkJoinStatus(brainwritingId, userId);
    const brainwritingUserStatus = await checkUserCount(brainwritingId);

    // X投稿版の場合はロック状態も返す
    if (usageScope === USAGE_SCOPE.XPOST) {
      const lockStatus = await checkSheetLockStatus(brainwritingId, userId);

      return NextResponse.json({
        ...joinStatus,
        ...lockStatus,
        ...brainwritingUserStatus,
      });
    }

    // チーム版の場合はロック状態を返さない
    // シートが存在していて参加者に含まれていない場合は参加不可
    const teamJoinable = await checkTeamJoinable(brainwritingId, userId);

    return NextResponse.json({
      ...joinStatus,
      ...brainwritingUserStatus,
      ...teamJoinable,
    });
  } catch (error) {
    console.error("参加状況チェックエラー:", error);
    return apiErrors.serverError();
  }
}
