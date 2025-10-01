import { z } from 'zod';
import { baseIdeaSchema, baseIdeaListItemSchema } from './idea-framework';
import { USAGE_SCOPE } from '@/utils/brainwriting';

// フォーム用スキーマ（ベース + 固有フィールド）
export const brainwritingFormDataSchema = baseIdeaSchema.extend({
  usageScope: z.enum([USAGE_SCOPE.XPOST, USAGE_SCOPE.TEAM], {
    message: "利用方法を選択してください"
  })
});

// 一覧表示用スキーマ（ベース + usageScope）
export const brainwritingListItemSchema = baseIdeaListItemSchema.extend({
  usageScope: z.enum([USAGE_SCOPE.XPOST, USAGE_SCOPE.TEAM])
});

// 型定義をZodスキーマから生成
export type BrainwritingListItem = z.infer<typeof brainwritingListItemSchema>;
export type BrainwritingFormData = z.infer<typeof brainwritingFormDataSchema>;