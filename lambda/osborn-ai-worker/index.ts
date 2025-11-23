/**
 * オズボーンのチェックリスト AI生成ワーカー Lambda関数
 *
 * 環境変数:
 * - DATABASE_URL: PostgreSQL接続文字列
 * - OPENAI_API_KEY: OpenAI APIキー
 * - OPENAI_MODEL: 使用するOpenAIモデル（例: gpt-5-nano）
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
import { eq, and, sql } from "drizzle-orm";
// PublishRequest（IAM認証）は不要になったため削除

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

const osborn_ai_generations = pgTable("osborn_ai_generations", {
  id: serial("id").primaryKey(),
  osborn_checklist_id: integer("osborn_checklist_id").notNull().unique(),
  generation_status: varchar("generation_status", { length: 20 }).notNull(),
  generation_result: text("generation_result"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

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
async function publishEvent(channel: string, eventType: string) {
  try {
    const appsyncUrl = process.env.APPSYNC_EVENTS_URL;
    const apiKey = process.env.APPSYNC_API_KEY;

    if (!appsyncUrl) {
      console.error("❌ APPSYNC_EVENTS_URL環境変数が設定されていません");
      return;
    }

    if (!apiKey) {
      console.error("❌ APPSYNC_API_KEY環境変数が設定されていません");
      return;
    }

    // チャンネル名にnamespaceを含める
    const fullChannel = `osborn${channel}`;

    console.log("📡 AppSync Events発行:", {
      fullChannel,
      eventType,
      appsyncUrl: appsyncUrl ? "✓" : "✗",
      apiKey: apiKey ? "✓" : "✗",
    });

    // API Key認証でリクエスト
    const response = await fetch(appsyncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        channel: fullChannel,
        events: [JSON.stringify({ type: eventType })],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ AppSync Events発行エラー:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
    } else {
      console.log("✅ AppSync Events発行成功");
    }
  } catch (error) {
    console.error("❌ AppSync Events例外:", {
      error,
      errorName: error instanceof Error ? error.name : "Unknown",
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }
}

// ============================================
// チェックリストタイプ定義
// ============================================
const OSBORN_CHECKLIST_TYPES = {
  TRANSFER: "transfer",
  APPLY: "apply",
  MODIFY: "modify",
  MAGNIFY: "magnify",
  MINIFY: "minify",
  SUBSTITUTE: "substitute",
  REARRANGE: "rearrange",
  REVERSE: "reverse",
  COMBINE: "combine",
} as const;

// ============================================
// 型定義
// ============================================
interface LambdaEvent {
  generationId: number;
  osbornChecklistId: number;
  userId: string;
}

interface AIGenerationResponse {
  isValid: boolean;
  reason: string;
  ideas: Record<string, string>;
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
  return typeof event === 'object' && event !== null && ('headers' in event || 'requestContext' in event);
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

export const handler: Handler = async (event) => {
  console.log("Lambda起動:", JSON.stringify(event));

  // HTTPリクエスト（Function URL）からの呼び出しの場合
  if (isFunctionUrlEvent(event)) {
    console.log("📡 Function URL経由の呼び出し");

    // 秘密トークン認証
    const secretToken = event.headers?.["x-api-secret"] || event.headers?.["X-Api-Secret"];
    const expectedToken = process.env.LAMBDA_SECRET_TOKEN;

    if (!expectedToken) {
      console.error("❌ LAMBDA_SECRET_TOKEN環境変数が設定されていません");
      return httpResponse(500, { error: "Server configuration error" });
    }

    if (secretToken !== expectedToken) {
      console.error("❌ 秘密トークンが一致しません");
      return httpResponse(403, { error: "Forbidden" });
    }

    // ボディをパース
    let payload: LambdaEvent;
    try {
      payload = JSON.parse(event.body || "{}");
    } catch (error) {
      console.error("❌ リクエストボディのパースエラー:", error);
      return httpResponse(400, { error: "Invalid JSON body" });
    }

    const { generationId, osbornChecklistId, userId } = payload;

    if (!generationId || !osbornChecklistId || !userId) {
      console.error("❌ 必須パラメータが不足:", payload);
      return httpResponse(400, {
        error: "generationId, osbornChecklistId, userId are required",
      });
    }

    // メイン処理を実行
    try {
      await processAIGeneration({ generationId, osbornChecklistId, userId });
      return httpResponse(200, { success: true, message: "AI生成を開始しました" });
    } catch (error) {
      console.error("❌ AI生成処理エラー:", error);
      return httpResponse(500, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // 従来のイベント形式（後方互換性）
  console.log("📡 直接Lambda呼び出し");
  const { generationId, osbornChecklistId, userId } = event as LambdaEvent;

  if (!generationId || !osbornChecklistId || !userId) {
    throw new Error("generationId, osbornChecklistId, userId are required");
  }

  await processAIGeneration({ generationId, osbornChecklistId, userId });
  return { success: true };
};

/**
 * AI生成のメイン処理
 */
async function processAIGeneration({
  generationId,
  osbornChecklistId,
  userId,
}: LambdaEvent): Promise<void> {

  const db = getDb();

  try {
    // ステータスを「処理中」に更新
    await db
      .update(osborn_ai_generations)
      .set({
        generation_status: "processing",
        updated_at: sql`NOW()`,
      })
      .where(eq(osborn_ai_generations.id, generationId));

    console.log(`AI生成ステータスを「処理中」に更新 (ID: ${generationId})`);

    // オズボーンのチェックリストを取得
    const [osbornChecklist] = await db
      .select()
      .from(osborn_checklists)
      .where(
        and(
          eq(osborn_checklists.id, osbornChecklistId),
          eq(osborn_checklists.user_id, userId)
        )
      )
      .limit(1);

    if (!osbornChecklist) {
      throw new Error("オズボーンのチェックリストが見つかりません");
    }

    // OpenAI APIを使用してアイデア生成
    const title = osbornChecklist.title;
    const themeName = osbornChecklist.theme_name;
    const description = osbornChecklist.description || "なし";

    const prompt = `あなたはアイデア発想の専門家です。以下の2つのステップを実行してください。

ステップ1: テーマの妥当性判断
以下のテーマが、アイデア発想のテーマとして適切かどうかを判断してください。

【タイトル】
${title}

【テーマ】
${themeName}

【説明】
${description}

判断基準：
- 意味のある言葉や概念であること
- 無意味な文字列（例：「あああ」「111」など）ではないこと
- アイデア発想が可能な具体性があること
- 不適切な内容（暴力、差別など）を含まないこと

ステップ2: アイデア生成（テーマが適切な場合のみ）
テーマが適切であれば、オズボーンのチェックリストの9つの視点から具体的で実践的なアイデアを1つずつ生成してください。各アイデアは100文字以内で簡潔にまとめてください。

1. 転用（transfer）：他の用途に転用できないか？
2. 応用（apply）：他のアイデアを応用できないか？
3. 変更（modify）：形・色・音・匂いなどを変更できないか？
4. 拡大（magnify）：大きく・長く・厚く・強くできないか？
5. 縮小（minify）：小さく・短く・薄く・軽くできないか？
6. 代用（substitute）：他のもので代用できないか？
7. 再配置（rearrange）：順序・パターン・レイアウトを変えられないか？
8. 逆転（reverse）：逆にできないか？
9. 結合（combine）：組み合わせられないか？

JSON形式で以下のように出力してください：
{
  "isValid": true または false,
  "reason": "判断理由（日本語で簡潔に）",
  "ideas": {
    "transfer": "転用のアイデア",
    "apply": "応用のアイデア",
    "modify": "変更のアイデア",
    "magnify": "拡大のアイデア",
    "minify": "縮小のアイデア",
    "substitute": "代用のアイデア",
    "rearrange": "再配置のアイデア",
    "reverse": "逆転のアイデア",
    "combine": "結合のアイデア"
  }
}

※テーマが不適切な場合は、ideasフィールドは空のオブジェクトにしてください。`;

    console.log("OpenAI API呼び出し開始");
    const startTime = Date.now();

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL!,
      messages: [
        {
          role: "system",
          content:
            "あなたはテーマの妥当性判断とアイデア発想の専門家です。JSON形式で回答してください。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const duration = Date.now() - startTime;
    console.log(`OpenAI API呼び出し完了（所要時間: ${duration}ms）`);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI応答が空です");
    }

    const result = JSON.parse(content) as AIGenerationResponse;

    // テーマが不適切な場合は失敗として処理
    if (!result.isValid) {
      const errorMsg = `テーマが適切ではありません: ${result.reason}`;
      await db
        .update(osborn_ai_generations)
        .set({
          generation_status: "failed",
          error_message: errorMsg,
          updated_at: sql`NOW()`,
        })
        .where(eq(osborn_ai_generations.id, generationId));

      await publishEvent(
        `/osborn-checklist/${osbornChecklistId}`,
        "AI_GENERATION_FAILED"
      );

      throw new Error(errorMsg);
    }

    const ideas = result.ideas;

    // レスポンスの検証
    const requiredKeys = Object.values(OSBORN_CHECKLIST_TYPES);
    const missingKeys = requiredKeys.filter(key => !ideas[key]);

    if (missingKeys.length > 0) {
      const errorMsg = `AI応答に必要なキーが不足しています: ${missingKeys.join(", ")}`;
      await db
        .update(osborn_ai_generations)
        .set({
          generation_status: "failed",
          error_message: errorMsg,
          updated_at: sql`NOW()`,
        })
        .where(eq(osborn_ai_generations.id, generationId));

      await publishEvent(
        `/osborn-checklist/${osbornChecklistId}`,
        "AI_GENERATION_FAILED"
      );

      throw new Error(errorMsg);
    }

    // データベースに保存（既存の入力が空でない場合はスキップ）
    console.log("AI生成結果をデータベースに保存開始");
    for (const [type, content] of Object.entries(ideas) as [string, string][]) {
      // 既存データを検索
      const [existingInput] = await db
        .select()
        .from(osborn_checklist_inputs)
        .where(
          and(
            eq(osborn_checklist_inputs.osborn_checklist_id, osbornChecklistId),
            eq(osborn_checklist_inputs.checklist_type, type)
          )
        )
        .limit(1);

      if (existingInput) {
        // 既存の入力が空でない場合はスキップ
        if (existingInput.content && existingInput.content.trim() !== "") {
          continue;
        }

        // 更新
        await db
          .update(osborn_checklist_inputs)
          .set({
            content: content,
            updated_at: sql`NOW()`,
          })
          .where(eq(osborn_checklist_inputs.id, existingInput.id));
      } else {
        // 新規作成
        await db.insert(osborn_checklist_inputs).values({
          osborn_checklist_id: osbornChecklistId,
          checklist_type: type,
          content: content,
        });
      }
    }
    console.log("AI生成結果の保存完了");

    // 生成結果を保存し、ステータスを「完了」に更新
    await db
      .update(osborn_ai_generations)
      .set({
        generation_status: "completed",
        generation_result: JSON.stringify(ideas),
        updated_at: sql`NOW()`,
      })
      .where(eq(osborn_ai_generations.id, generationId));

    // AppSync Eventsで通知
    await publishEvent(
      `/osborn-checklist/${osbornChecklistId}`,
      "AI_GENERATION_COMPLETED"
    );

    console.log("AI生成が正常に完了しました");
  } catch (error) {
    console.error("AI生成ワーカーエラー:", error);

    // エラー状態を更新
    const errorMsg = error instanceof Error ? error.message : "不明なエラーが発生しました";
    await db
      .update(osborn_ai_generations)
      .set({
        generation_status: "failed",
        error_message: errorMsg,
        updated_at: sql`NOW()`,
      })
      .where(eq(osborn_ai_generations.id, generationId));

    await publishEvent(
      `/osborn-checklist/${osbornChecklistId}`,
      "AI_GENERATION_FAILED"
    );

    throw error;
  }
};
