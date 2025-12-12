/**
 * マンダラート用のイベント発行ヘルパー関数
 */
import { publishEvent } from "./server";
import { NAMESPACES } from "./namespaces";
import { MandalartEventType } from "./event-types";

/**
 * マンダラートのイベントを発行
 * エラーが発生してもメイン処理には影響しない
 * @param mandalartId - マンダラートID
 * @param eventType - イベントタイプ
 * @param errorMessage - エラーメッセージ（失敗時のみ）
 */
export async function publishMandalartEvent(
  mandalartId: number,
  eventType: MandalartEventType,
  errorMessage?: string
): Promise<void> {
  try {
    await publishEvent({
      namespace: NAMESPACES.MANDALART,
      channel: `/mandalart/${mandalartId}`,
      data: {
        type: eventType,
        ...(errorMessage && { errorMessage }),
      },
    });
  } catch (error) {
    console.error("AppSync Eventsイベント発行エラー:", error);
  }
}
