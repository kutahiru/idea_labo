import { NextRequest, NextResponse } from "next/server";
import { checkAuth, apiErrors } from "@/lib/api/utils";
import { joinBrainwriting } from "@/lib/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";

/**
 * ブレインライティングに参加するPOST APIエンドポイント
 *
 * 認証済みユーザーが招待リンクからブレインライティングに参加します。
 * 参加後、AppSync Eventsで全参加者にリアルタイム通知を送信します。
 *
 * エンドポイント: POST /api/brainwritings/join
 *
 * リクエストボディ:
 * ```json
 * {
 *   "brainwritingId": 123,
 *   "usageScope": "xpost" | "team"
 * }
 * ```
 *
 * 処理フロー:
 * 1. ユーザー認証を確認
 * 2. brainwriting_usersテーブルに参加記録を追加
 * 3. AppSync Eventsで USER_JOINED イベントを発行
 * 4. 全参加者のクライアントが参加者一覧を再取得
 *
 * レスポンス例:
 * ```json
 * {
 *   "message": "参加しました",
 *   "data": {
 *     "id": 1,
 *     "brainwriting_id": 123,
 *     "user_id": "user-123",
 *     "created_at": "2024-01-01T00:00:00Z"
 *   },
 *   "sheetId": 456
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（ボディにbrainwritingIdとusageScopeを含む）
 * @returns 参加結果を含むJSONレスポンス、またはエラーレスポンス
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAuth();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { brainwritingId, usageScope } = await request.json();
    if (!brainwritingId || typeof brainwritingId !== "number") {
      return apiErrors.invalidId();
    }

    if (!usageScope || typeof usageScope !== "string") {
      return NextResponse.json(
        { error: "usageScopeが必要です" },
        { status: 400 }
      );
    }

    const result = await joinBrainwriting(brainwritingId, authResult.userId, usageScope);

    // AppSync Eventsにイベントを発行
    console.log(`📢 USER_JOINEDイベント発行開始 (brainwritingId: ${brainwritingId})`);
    await publishBrainwritingEvent(brainwritingId, BRAINWRITING_EVENT_TYPES.USER_JOINED);
    console.log(`✅ USER_JOINEDイベント発行完了`);

    return NextResponse.json({
      message: "参加しました",
      data: result.data,
      sheetId: result.sheetId,
    });
  } catch (error) {
    console.error("ブレインライティング参加エラー:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
