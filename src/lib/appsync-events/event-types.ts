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

// AI生成イベントタイプ（オズボーン・マンダラート共通）
export const AI_GENERATION_EVENT_TYPES = {
  COMPLETED: "AI_GENERATION_COMPLETED",
  FAILED: "AI_GENERATION_FAILED",
} as const;

export type AIGenerationEventType =
  (typeof AI_GENERATION_EVENT_TYPES)[keyof typeof AI_GENERATION_EVENT_TYPES];
