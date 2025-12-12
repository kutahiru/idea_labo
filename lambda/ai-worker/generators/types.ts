/**
 * AI生成ジェネレーターの共通型定義
 */
import OpenAI from "openai";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// DB Schemaの型（Lambda内で定義したテーブル）
export interface DbSchemas {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  osborn_checklists: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  osborn_checklist_inputs: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mandalarts: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mandalart_inputs: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ai_generations: any;
}

/**
 * ジェネレーターに渡すコンテキスト
 */
export interface GeneratorContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: PostgresJsDatabase<any>;
  openai: OpenAI;
  targetId: number;
  userId: string;
  schemas: DbSchemas;
}

/**
 * ジェネレーターの結果
 */
export interface GeneratorResult {
  success: boolean;
  result?: Record<string, unknown>;
  errorMessage?: string;
}

/**
 * サポートするターゲットタイプ
 */
export type TargetType = "osborn_checklist" | "mandalart";
