import { createSheetsForTeam, checkJoinStatus } from "@/lib/brainwriting";
import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";

/**
 * ブレインライティング（チーム版）を開始するPOST APIエンドポイント
 *
 * 参加者全員分のシートを作成し、ブレインライティングを開始します。
 * 開始後、AppSync Eventsを通じて全参加者にリアルタイムで通知されます。
 *
 * エンドポイント: POST /api/brainwritings/[id]/start
 *
 * 処理フロー:
 * 1. ユーザーの参加状態を確認（未参加の場合はエラー）
 * 2. 参加者全員分のシートを作成
 * 3. AppSync Eventsで BRAINWRITING_STARTED イベントを発行
 * 4. 全参加者のクライアントがシート情報を再取得
 *
 * レスポンス例:
 * ```json
 * {
 *   "message": "シートが作成されました",
 *   "count": 5
 * }
 * ```
 *
 * @param _request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: ブレインライティングID）
 * @returns シート作成結果を含むJSONレスポンス、またはエラーレスポンス
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingId } = validateResult;

    // 参加チェック
    const joinStatus = await checkJoinStatus(brainwritingId, userId);
    if (!joinStatus.isJoined) {
      return apiErrors.forbidden("参加していません");
    }

    const result = await createSheetsForTeam(brainwritingId);

    // AppSync Eventsにイベントを発行
    await publishBrainwritingEvent(brainwritingId, BRAINWRITING_EVENT_TYPES.BRAINWRITING_STARTED);

    return NextResponse.json(result);
  } catch (error) {
    console.error("シート作成エラー:", error);
    return apiErrors.serverError();
  }
}
