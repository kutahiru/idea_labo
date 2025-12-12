/**
 * AI生成ワーカー Lambda関数（汎用）
 *
 * オズボーンのチェックリストとマンダラートの両方に対応
 *
 * 環境変数:
 * - DATABASE_URL: PostgreSQL接続文字列
 * - OPENAI_API_KEY: OpenAI APIキー
 * - OPENAI_MODEL: 使用するOpenAIモデル（例: gpt-4o-mini）
 * - APPSYNC_EVENTS_URL: AppSync Events エンドポイント
 * - APPSYNC_API_KEY: AppSync API Key（イベント発行用）
 * - LAMBDA_SECRET_TOKEN: HTTPリクエスト認証用の秘密トークン
 *
 * 呼び出し方法:
 * 1. Lambda Function URL経由（HTTPリクエスト）
 * 2. 直接Lambdaイベント（後方互換性）
 */

import { Handler } from "aws-lambda";
import OpenAI from "openai";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";

import { generateOsborn, getOsbornChannel, getOsbornNamespace } from "./generators/osborn";
import { generateMandalart, getMandalartChannel, getMandalartNamespace } from "./generators/mandalart";
import { TargetType, DbSchemas } from "./generators/types";

// ============================================
// DB Schema定義
// ============================================
const osborn_checklists = pgTable("osborn_checklists", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  theme_name: varchar("theme_name", { length: 100 }).notNull(),
  description: varchar("description", { length: 1000 }),
  public_token: varchar("public_token", { length: 100 }).notNull().unique(),
  is_results_public: boolean("is_results_public").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

const osborn_checklist_inputs = pgTable("osborn_checklist_inputs", {
  id: serial("id").primaryKey(),
  osborn_checklist_id: integer("osborn_checklist_id").notNull(),
  checklist_type: varchar("checklist_type", { length: 50 }).notNull(),
  content: varchar("content", { length: 1000 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

const mandalarts = pgTable("mandalarts", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  theme_name: varchar("theme_name", { length: 100 }).notNull(),
  description: varchar("description", { length: 1000 }),
  public_token: varchar("public_token", { length: 100 }).notNull().unique(),
  is_results_public: boolean("is_results_public").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

const mandalart_inputs = pgTable("mandalart_inputs", {
  id: serial("id").primaryKey(),
  mandalart_id: integer("mandalart_id").notNull(),
  section_row_index: integer("section_row_index").notNull(),
  section_column_index: integer("section_column_index").notNull(),
  row_index: integer("row_index").notNull(),
  column_index: integer("column_index").notNull(),
  content: varchar("content", { length: 100 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

const ai_generations = pgTable("ai_generations", {
  id: serial("id").primaryKey(),
  target_type: varchar("target_type", { length: 30 }).notNull(),
  target_id: integer("target_id").notNull(),
  generation_status: varchar("generation_status", { length: 20 }).notNull(),
  generation_result: text("generation_result"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// Schema オブジェクト
const schemas: DbSchemas = {
  osborn_checklists,
  osborn_checklist_inputs,
  mandalarts,
  mandalart_inputs,
  ai_generations,
};

// ============================================
// OpenAI初期化
// ============================================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 3 * 60 * 1000, // 3分のタイムアウト
});

// ============================================
// DB接続（グローバルで再利用）
// ============================================
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!dbInstance) {
    const client = postgres(process.env.DATABASE_URL!, {
      max: 1, // Lambda環境では接続数を最小限に
    });
    dbInstance = drizzle(client);
  }
  return dbInstance;
}

// ============================================
// AppSync Events通知（API Key認証）
// ============================================
async function publishEvent(
  namespace: string,
  channel: string,
  eventType: string,
  errorMessage?: string
) {
  try {
    const appsyncUrl = process.env.APPSYNC_EVENTS_URL;
    const apiKey = process.env.APPSYNC_API_KEY;

    if (!appsyncUrl) {
      console.error("APPSYNC_EVENTS_URL環境変数が設定されていません");
      return;
    }

    if (!apiKey) {
      console.error("APPSYNC_API_KEY環境変数が設定されていません");
      return;
    }

    // チャンネル名にnamespaceを含める
    const fullChannel = `${namespace}${channel}`;

    console.log("AppSync Events発行:", {
      fullChannel,
      eventType,
    });

    // イベントデータを構築
    const eventData: { type: string; errorMessage?: string } = { type: eventType };
    if (errorMessage) {
      eventData.errorMessage = errorMessage;
    }

    // API Key認証でリクエスト
    const response = await fetch(appsyncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        channel: fullChannel,
        events: [JSON.stringify(eventData)],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AppSync Events発行エラー:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
    } else {
      console.log("AppSync Events発行成功");
    }
  } catch (error) {
    console.error("AppSync Events例外:", {
      error,
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
  }
}

// ============================================
// 型定義
// ============================================
interface LambdaEvent {
  generationId: number;
  targetType: TargetType;
  targetId: number;
  userId: string;
  // 後方互換性のため
  osbornChecklistId?: number;
}

// Lambda Function URL用のイベント型
interface FunctionUrlEvent {
  headers?: Record<string, string>;
  body?: string;
  requestContext?: {
    requestId: string;
  };
}

/**
 * HTTPリクエストかどうかを判定
 */
function isFunctionUrlEvent(event: unknown): event is FunctionUrlEvent {
  return typeof event === "object" && event !== null && ("headers" in event || "requestContext" in event);
}

/**
 * HTTPレスポンスを返す
 */
function httpResponse(statusCode: number, body: Record<string, unknown>) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}

/**
 * ターゲットタイプに応じたチャンネル情報を取得
 */
function getChannelInfo(targetType: TargetType, targetId: number): { namespace: string; channel: string } {
  switch (targetType) {
    case "osborn_checklist":
      return {
        namespace: getOsbornNamespace(),
        channel: getOsbornChannel(targetId),
      };
    case "mandalart":
      return {
        namespace: getMandalartNamespace(),
        channel: getMandalartChannel(targetId),
      };
    default:
      throw new Error(`Unknown target type: ${targetType}`);
  }
}

export const handler: Handler = async (event) => {
  console.log("Lambda起動:", JSON.stringify(event));

  // HTTPリクエスト（Function URL）からの呼び出しの場合
  if (isFunctionUrlEvent(event)) {
    console.log("Function URL経由の呼び出し");

    // 秘密トークン認証
    const secretToken = event.headers?.["x-api-secret"] || event.headers?.["X-Api-Secret"];
    const expectedToken = process.env.LAMBDA_SECRET_TOKEN;

    if (!expectedToken) {
      console.error("LAMBDA_SECRET_TOKEN環境変数が設定されていません");
      return httpResponse(500, { error: "Server configuration error" });
    }

    if (secretToken !== expectedToken) {
      console.error("秘密トークンが一致しません");
      return httpResponse(403, { error: "Forbidden" });
    }

    // ボディをパース
    let payload: LambdaEvent;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (error) {
      console.error("リクエストボディのパースエラー:", error);
      return httpResponse(400, { error: "Invalid JSON body" });
    }

    // 後方互換性: osbornChecklistId がある場合は変換
    if (payload.osbornChecklistId && !payload.targetId) {
      payload.targetType = "osborn_checklist";
      payload.targetId = payload.osbornChecklistId;
    }

    const { generationId, targetType, targetId, userId } = payload;

    if (!generationId || !targetType || !targetId || !userId) {
      console.error("必須パラメータが不足:", payload);
      return httpResponse(400, {
        error: "generationId, targetType, targetId, userId are required",
      });
    }

    // メイン処理を実行
    try {
      await processAIGeneration({ generationId, targetType, targetId, userId });
      return httpResponse(200, { success: true, message: "AI生成を開始しました" });
    } catch (error) {
      console.error("AI生成処理エラー:", error);
      return httpResponse(500, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // 従来のイベント形式（後方互換性）
  console.log("直接Lambda呼び出し");
  let lambdaEvent = event as LambdaEvent;

  // 後方互換性: osbornChecklistId がある場合は変換
  if (lambdaEvent.osbornChecklistId && !lambdaEvent.targetId) {
    lambdaEvent = {
      ...lambdaEvent,
      targetType: "osborn_checklist",
      targetId: lambdaEvent.osbornChecklistId,
    };
  }

  const { generationId, targetType, targetId, userId } = lambdaEvent;

  if (!generationId || !targetType || !targetId || !userId) {
    throw new Error("generationId, targetType, targetId, userId are required");
  }

  await processAIGeneration({ generationId, targetType, targetId, userId });
  return { success: true };
};

/**
 * AI生成のメイン処理
 */
async function processAIGeneration({
  generationId,
  targetType,
  targetId,
  userId,
}: {
  generationId: number;
  targetType: TargetType;
  targetId: number;
  userId: string;
}): Promise<void> {
  const db = getDb();
  const { namespace, channel } = getChannelInfo(targetType, targetId);

  try {
    // ステータスを「処理中」に更新
    await db
      .update(ai_generations)
      .set({
        generation_status: "processing",
        updated_at: sql`NOW()`,
      })
      .where(eq(ai_generations.id, generationId));

    console.log(`AI生成ステータスを「処理中」に更新 (ID: ${generationId}, Type: ${targetType})`);

    // ターゲットタイプに応じた生成処理を実行
    const ctx = {
      db,
      openai,
      targetId,
      userId,
      schemas,
    };

    let result;
    switch (targetType) {
      case "osborn_checklist":
        result = await generateOsborn(ctx);
        break;
      case "mandalart":
        result = await generateMandalart(ctx);
        break;
      default:
        throw new Error(`Unknown target type: ${targetType}`);
    }

    // 結果に応じてステータスを更新
    if (!result.success) {
      await db
        .update(ai_generations)
        .set({
          generation_status: "failed",
          error_message: result.errorMessage,
          updated_at: sql`NOW()`,
        })
        .where(eq(ai_generations.id, generationId));

      await publishEvent(namespace, channel, "AI_GENERATION_FAILED", result.errorMessage);
      return;
    }

    // 成功時の更新
    await db
      .update(ai_generations)
      .set({
        generation_status: "completed",
        generation_result: JSON.stringify(result.result),
        updated_at: sql`NOW()`,
      })
      .where(eq(ai_generations.id, generationId));

    await publishEvent(namespace, channel, "AI_GENERATION_COMPLETED");
    console.log("AI生成が正常に完了しました");
  } catch (error) {
    console.error("AI生成ワーカーエラー:", error);

    // エラー状態を更新
    const errorMsg = error instanceof Error ? error.message : "不明なエラーが発生しました";
    await db
      .update(ai_generations)
      .set({
        generation_status: "failed",
        error_message: errorMsg,
        updated_at: sql`NOW()`,
      })
      .where(eq(ai_generations.id, generationId));

    await publishEvent(
      namespace,
      channel,
      "AI_GENERATION_FAILED",
      "AIでのアイデア生成に失敗しました。再度お試しください。"
    );
  }
}
