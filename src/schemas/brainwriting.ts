import { z } from "zod";
import { baseIdeaSchema } from "./idea-framework";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// フォーム用スキーマ(ベースを元にブレインライティングフォーム用のzodスキーマを定義)
export const brainwritingFormDataSchema = baseIdeaSchema.extend({
  usageScope: z.enum([USAGE_SCOPE.XPOST, USAGE_SCOPE.TEAM], {
    message: "利用方法を選択してください",
  }),
});

// 型定義をZodスキーマから生成
export type BrainwritingFormData = z.infer<typeof brainwritingFormDataSchema>;
