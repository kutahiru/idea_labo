/**
 * オズボーンのチェックリスト用のイベント発行ヘルパー関数
 */
import { publishEvent } from "./server";
import { NAMESPACES } from "./namespaces";
import { OsbornChecklistEventType } from "./event-types";

/**
 * オズボーンのチェックリストのイベントを発行
 * エラーが発生してもメイン処理には影響しない
 */
export async function publishOsbornChecklistEvent(
  osbornChecklistId: number,
  eventType: OsbornChecklistEventType
): Promise<void> {
  try {
    await publishEvent({
      namespace: NAMESPACES.OSBORN,
      channel: `/osborn-checklist/${osbornChecklistId}`,
      data: {
        type: eventType,
      },
    });
  } catch (error) {
    console.error("AppSync Eventsイベント発行エラー:", error);
  }
}
