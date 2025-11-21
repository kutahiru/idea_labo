/**
 * オズボーンのチェックリスト AI生成ワーカー Lambda関数
 *
 * 環境変数:
 * - DATABASE_URL: PostgreSQL接続文字列
 * - OPENAI_API_KEY: OpenAI APIキー
 * - OPENAI_MODEL: 使用するOpenAIモデル（例: gpt-5-nano）
 * - APPSYNC_EVENTS_URL: AppSync Events エンドポイント
 *
 * IAM認証:
 * - Lambda関数のIAMロールにAppSync Events発行権限が必要
 */

import { Handler } from "aws-lambda";
import OpenAI from "openai";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { eq, and, sql } from "drizzle-orm";
import { PublishRequest } from "ob-appsync-events-request";

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
// AppSync Events通知
// ============================================
async function publishEvent(channel: string, eventType: string) {
  try {
    // IAM署名付きリクエストを作成
    const request = await PublishRequest.signed(
      process.env.APPSYNC_EVENTS_URL!,
      channel,
      {
        namespace: "osborn",
        data: { type: eventType },
      }
    );

    // fetchでリクエスト送信
    const response = await fetch(request);

    if (!response.ok) {
      console.error("AppSync Events発行エラー:", await response.text());
    }
  } catch (error) {
    console.error("AppSync Events発行エラー:", error);
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

export const handler: Handler<LambdaEvent> = async (event) => {
  console.log("Lambda起動:", JSON.stringify(event));

  const { generationId, osbornChecklistId, userId } = event;

  if (!generationId || !osbornChecklistId || !userId) {
    throw new Error("generationId, osbornChecklistId, userId are required");
  }

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

      return { statusCode: 400, body: errorMsg };
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

      return { statusCode: 500, body: errorMsg };
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

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, ideas }),
    };
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
