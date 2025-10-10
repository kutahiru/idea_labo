import { z } from "zod";

export const userFormDataSchema = z.object({
  name: z
    .string()
    .min(1, "名前は必須です")
    .max(100, "名前は100文字以内で入力してください"),
});

export type UserFormData = z.infer<typeof userFormDataSchema>;
