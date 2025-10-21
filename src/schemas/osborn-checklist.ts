import z from "zod";
import { baseIdeaSchema } from "./idea-framework";

/**
 * オズボーンのチェックリストの9つの視点
 */
export const OSBORN_CHECKLIST_TYPES = {
  TRANSFER: "transfer", // 転用
  APPLY: "apply", // 応用
  MODIFY: "modify", // 変更
  MAGNIFY: "magnify", // 拡大
  MINIFY: "minify", // 縮小
  SUBSTITUTE: "substitute", // 代用
  REARRANGE: "rearrange", // 再配置
  REVERSE: "reverse", // 逆転
  COMBINE: "combine", // 結合
} as const;

export type OsbornChecklistType = (typeof OSBORN_CHECKLIST_TYPES)[keyof typeof OSBORN_CHECKLIST_TYPES];

/**
 * チェックリストの種類と日本語名のマッピング
 */
export const OSBORN_CHECKLIST_NAMES: Record<OsbornChecklistType, string> = {
  [OSBORN_CHECKLIST_TYPES.TRANSFER]: "転用",
  [OSBORN_CHECKLIST_TYPES.APPLY]: "応用",
  [OSBORN_CHECKLIST_TYPES.MODIFY]: "変更",
  [OSBORN_CHECKLIST_TYPES.MAGNIFY]: "拡大",
  [OSBORN_CHECKLIST_TYPES.MINIFY]: "縮小",
  [OSBORN_CHECKLIST_TYPES.SUBSTITUTE]: "代用",
  [OSBORN_CHECKLIST_TYPES.REARRANGE]: "再配置",
  [OSBORN_CHECKLIST_TYPES.REVERSE]: "逆転",
  [OSBORN_CHECKLIST_TYPES.COMBINE]: "結合",
} as const;

// オズボーンのチェックリストは特別な項目がないため、ベーススキーマをそのまま使用
export const osbornChecklistFormDataSchema = baseIdeaSchema;

// 型定義をZodスキーマから生成
export type OsbornChecklistFormData = z.infer<typeof osbornChecklistFormDataSchema>;
