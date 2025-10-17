/**
 * ブレインライティング用のイベント発行ヘルパー関数
 */
import { publishEvent } from "./server";
import { NAMESPACES } from "./namespaces";
import { BRAINWRITING_EVENT_TYPES, BrainwritingEventType } from "./event-types";

/**
 * ブレインライティングのイベントを発行
 * エラーが発生してもメイン処理には影響しない
 */
export async function publishBrainwritingEvent(
  brainwritingId: number,
  eventType: BrainwritingEventType
): Promise<void> {
  try {
    await publishEvent({
      namespace: NAMESPACES.BRAINWRITING,
      channel: `/brainwriting/${brainwritingId}`,
      data: {
        type: eventType,
      },
    });
  } catch (error) {
    console.error("AppSync Eventsイベント発行エラー:", error);
  }
}
