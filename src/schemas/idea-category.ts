import { z } from "zod";

export const ideaCategoryFormDataSchema = z.object({
  name: z
    .string()
    .min(1, "カテゴリ名は必須です")
    .max(100, "カテゴリ名は100文字以内で入力してください"),
  description: z.string().max(500, "説明は500文字以内で入力してください").nullable(),
});

export type IdeaCategoryFormData = z.infer<typeof ideaCategoryFormDataSchema>;
