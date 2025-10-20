import z from "zod";
import { baseIdeaSchema } from "./idea-framework";

// マンダラートは特別な項目がないため、ベーススキーマをそのまま使用
export const mandalartFormDataSchema = baseIdeaSchema;

// 型定義をZodスキーマから生成
export type MandalartFormData = z.infer<typeof mandalartFormDataSchema>;

// マンダラート入力用スキーマ
export const mandalartInputSchema = z.object({
  mandalartId: z.number().int().positive(),
  sectionRowIndex: z.number().int().min(0).max(2),
  sectionColumnIndex: z.number().int().min(0).max(2),
  rowIndex: z.number().int().min(0).max(2),
  columnIndex: z.number().int().min(0).max(2),
  content: z.string().max(30),
});

export type MandalartInputRequest = z.infer<typeof mandalartInputSchema>;
