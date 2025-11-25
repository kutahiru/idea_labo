import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import {
  unlockSheet,
  rotateSheetToNextUser,
  getBrainwritingSheetWithBrainwriting,
} from "@/lib/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import { publishBrainwritingEvent } from "@/lib/appsync-events/brainwriting-events";
import { BRAINWRITING_EVENT_TYPES } from "@/lib/appsync-events/event-types";

interface CompleteParams {
  params: Promise<{ id: string }>;
}

/**
 * ブレインライティングのシート完了処理を行うPOST APIエンドポイント
 *
 * ユーザーがシートへの入力を完了した際に呼び出されます。
 * usageScope（X投稿版/チーム版）によって動作が異なります。
 *
 * エンドポイント: POST /api/brainwritings/sheets/[id]/complete
 *
 * X投稿版（usageScope: "xpost"）の場合：
 * - シートのロックを解除（current_user_id を NULL に設定）
 * - 他のユーザーがそのシートを使えるようになる
 *
 * チーム版（usageScope: "team"）の場合：
 * - シートを次のユーザーにローテーション（current_user_id を次の参加者に変更）
 * - AppSync Eventsで SHEET_ROTATED イベントを発行
 * - 全参加者のクライアントがシート情報を再取得
 *
 * レスポンス例:
 * ```json
 * {
 *   "success": true
 * }
 * ```
 *
 * @param request - Next.jsのRequestオブジェクト（未使用）
 * @param params - ルートパラメータ（id: ブレインライティングシートID）
 * @returns 成功結果を含むJSONレスポンス、またはエラーレスポンス
 */
export async function POST(request: NextRequest, { params }: CompleteParams) {
  try {
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: brainwritingSheetId } = validateResult;

    const data = await getBrainwritingSheetWithBrainwriting(brainwritingSheetId);
    if (!data || !data.brainwriting) {
      return NextResponse.json({ error: "シートが見つかりません" }, { status: 404 });
    }

    // チーム利用版の場合は次のユーザーに交代、X投稿版の場合はロック解除
    if (data.brainwriting.usageScope === USAGE_SCOPE.TEAM) {
      await rotateSheetToNextUser(brainwritingSheetId, userId);

      // AppSync Eventsにシートローテーションイベントを発行
      await publishBrainwritingEvent(data.brainwriting.id, BRAINWRITING_EVENT_TYPES.SHEET_ROTATED);
    } else {
      await unlockSheet(brainwritingSheetId, userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("シート完了エラー:", error);
    return apiErrors.serverError();
  }
}
