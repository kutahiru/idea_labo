import { z } from 'zod';
import { baseIdeaSchema, baseIdeaListItemSchema } from './idea-framework';

// フォーム用スキーマ（ベース + 固有フィールド）
export const brainwritingFormDataSchema = baseIdeaSchema.extend({
  usageScope: z.enum(["xpost", "team"], {
    message: "利用方法を選択してください"
  })
});

// 一覧表示用スキーマ（ベース + usageScope）
export const brainwritingListItemSchema = baseIdeaListItemSchema.extend({
  usageScope: z.enum(["xpost", "team"])
});

// 型定義をZodスキーマから生成
export type BrainwritingListItem = z.infer<typeof brainwritingListItemSchema>;
export type BrainwritingFormData = z.infer<typeof brainwritingFormDataSchema>;