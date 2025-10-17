/**
 * AppSync Events のイベントタイプ定義
 */
export const BRAINWRITING_EVENT_TYPES = {
  USER_JOINED: "USER_JOINED",
  BRAINWRITING_STARTED: "BRAINWRITING_STARTED",
  SHEET_ROTATED: "SHEET_ROTATED",
} as const;

export type BrainwritingEventType =
  (typeof BRAINWRITING_EVENT_TYPES)[keyof typeof BRAINWRITING_EVENT_TYPES];
