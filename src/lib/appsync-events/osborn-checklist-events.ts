/**
 * オズボーンのチェックリスト用のイベント発行ヘルパー関数
 */
import { publishEvent } from "./server";
import { NAMESPACES } from "./namespaces";
import { AIGenerationEventType } from "./event-types";

/**
 * オズボーンのチェックリストのイベントを発行
 * エラーが発生してもメイン処理には影響しない
 * @param osbornChecklistId - オズボーンのチェックリストID
 * @param eventType - イベントタイプ
 * @param errorMessage - エラーメッセージ（失敗時のみ）
 */
export async function publishOsbornChecklistEvent(
  osbornChecklistId: number,
  eventType: AIGenerationEventType,
  errorMessage?: string
): Promise<void> {
  try {
    await publishEvent({
      namespace: NAMESPACES.OSBORN,
      channel: `/osborn-checklist/${osbornChecklistId}`,
      data: {
        type: eventType,
        ...(errorMessage && { errorMessage }),
      },
    });
  } catch (error) {
    console.error("AppSync Eventsイベント発行エラー:", error);
  }
}
