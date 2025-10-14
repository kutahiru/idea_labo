import { z } from "zod";

export const ideaFormDataSchema = z.object({
  name: z
    .string()
    .min(1, "アイデア名は必須です")
    .max(100, "アイデア名は100文字以内で入力してください"),
  description: z.string().max(1000, "説明は500文字以内で入力してください").nullable(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

export type IdeaFormData = z.infer<typeof ideaFormDataSchema>;
