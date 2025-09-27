import { z } from "zod";

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
  createdAt: z.date(),
});

// ベース型定義をZodスキーマから生成
export type BaseIdeaFormData = z.infer<typeof baseIdeaSchema>;
export type BaseIdeaListItem = z.infer<typeof baseIdeaListItemSchema>;
