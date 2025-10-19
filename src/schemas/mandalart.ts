import z from "zod";
import { baseIdeaSchema } from "./idea-framework";

// マンダラートは特別な項目がないため、ベーススキーマをそのまま使用
export const mandalartFormDataSchema = baseIdeaSchema;

// 型定義をZodスキーマから生成
export type MandalartFormData = z.infer<typeof mandalartFormDataSchema>;
