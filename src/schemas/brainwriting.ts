import { z } from 'zod';

// ブレインライティングのベーススキーマ
const brainwritingBaseSchema = z.object({
  title: z.string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内で入力してください"),
  themeName: z.string()
    .min(1, "テーマ名は必須です")
    .max(50, "テーマ名は50文字以内で入力してください"),
  description: z.string()
    .max(500, "説明は500文字以内で入力してください")
    .nullable(),
  usageScope: z.enum(["xpost", "team"], {
    message: "利用方法を選択してください"
  })
});

// 一覧表示用スキーマ（idとcreatedAtが必須）
export const brainwritingListItemSchema = brainwritingBaseSchema.extend({
  id: z.number(),
  createdAt: z.date()
});

// フォーム用スキーマ（idとcreatedAtがオプショナル）
export const brainwritingFormDataSchema = brainwritingBaseSchema.extend({
  id: z.number().optional(),
  createdAt: z.date().optional()
});

// 型定義をZodスキーマから生成
export type BrainwritingListItem = z.infer<typeof brainwritingListItemSchema>;
export type BrainwritingFormData = z.infer<typeof brainwritingFormDataSchema>;