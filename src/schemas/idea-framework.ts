import { z } from "zod";

// アイデアフレームワークの種類
export const IDEA_FRAMEWORK_TYPES = {
  BRAINWRITING: "brainwriting",
  MANDALART: "mandalart",
  OSBORN_CHECKLIST: "osborn_checklist",
} as const;

export type IdeaFrameworkType = (typeof IDEA_FRAMEWORK_TYPES)[keyof typeof IDEA_FRAMEWORK_TYPES];

// アイデアフレームワークの表示名
export const IDEA_FRAMEWORK_NAMES: Record<IdeaFrameworkType, string> = {
  [IDEA_FRAMEWORK_TYPES.BRAINWRITING]: "ブレインライティング",
  [IDEA_FRAMEWORK_TYPES.MANDALART]: "マンダラート",
  [IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST]: "オズボーンのチェックリスト",
} as const;

// アイデアフレームワークのベースURL
export const IDEA_FRAMEWORK_BASE_URLS: Record<IdeaFrameworkType, string> = {
  [IDEA_FRAMEWORK_TYPES.BRAINWRITING]: "/brainwritings",
  [IDEA_FRAMEWORK_TYPES.MANDALART]: "/mandalarts",
  [IDEA_FRAMEWORK_TYPES.OSBORN_CHECKLIST]: "/osborn-checklists",
} as const;

// 全アイデアフレームワーク共通のベーススキーマ
// 各フレームワークの追加項目についてはそれぞれのファイルで管理する
export const baseIdeaSchema = z.object({
  id: z.number().optional(),
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  themeName: z.string().min(1, "テーマは必須です").max(50, "テーマは50文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").nullable(),
});

// 一覧表示用のベーススキーマ（idとcreatedAtが必須）
export const baseIdeaListItemSchema = baseIdeaSchema.extend({
  id: z.number(),
  userId: z.string(),
  createdAt: z.date(),
});

// ベース型定義をZodスキーマから生成
export type BaseIdeaFormData = z.infer<typeof baseIdeaSchema>;
export type BaseIdeaListItem = z.infer<typeof baseIdeaListItemSchema>;
