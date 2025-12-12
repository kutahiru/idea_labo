/**
 * オズボーンのチェックリスト用 AI生成ロジック
 */
import { eq, and, sql } from "drizzle-orm";
import { GeneratorContext, GeneratorResult } from "./types";

// チェックリストタイプ定義
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

interface OsbornAIResponse {
  isValid: boolean;
  reason: string;
  ideas: Record<string, string>;
}

/**
 * オズボーンのチェックリスト用AI生成処理
 */
export async function generateOsborn(ctx: GeneratorContext): Promise<GeneratorResult> {
  const { db, openai, targetId, userId, schemas } = ctx;
  const { osborn_checklists, osborn_checklist_inputs } = schemas;

  // オズボーンのチェックリストを取得
  const [osbornChecklist] = await db
    .select()
    .from(osborn_checklists)
    .where(
      and(
        eq(osborn_checklists.id, targetId),
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

  console.log("OpenAI API呼び出し開始（オズボーン）");
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

  const result = JSON.parse(content) as OsbornAIResponse;

  // テーマが不適切な場合
  if (!result.isValid) {
    return {
      success: false,
      errorMessage: "テーマが適切ではありません",
    };
  }

  const ideas = result.ideas;

  // レスポンスの検証
  const requiredKeys = Object.values(OSBORN_CHECKLIST_TYPES);
  const missingKeys = requiredKeys.filter(key => !ideas[key]);

  if (missingKeys.length > 0) {
    return {
      success: false,
      errorMessage: "AIでのアイデア生成に失敗しました。再度お試しください。",
    };
  }

  // データベースに保存（既存の入力が空でない場合はスキップ）
  console.log("AI生成結果をデータベースに保存開始");
  for (const [type, ideaContent] of Object.entries(ideas) as [string, string][]) {
    // 既存データを検索
    const [existingInput] = await db
      .select()
      .from(osborn_checklist_inputs)
      .where(
        and(
          eq(osborn_checklist_inputs.osborn_checklist_id, targetId),
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
          content: ideaContent,
          updated_at: sql`NOW()`,
        })
        .where(eq(osborn_checklist_inputs.id, existingInput.id));
    } else {
      // 新規作成
      await db.insert(osborn_checklist_inputs).values({
        osborn_checklist_id: targetId,
        checklist_type: type,
        content: ideaContent,
      });
    }
  }
  console.log("AI生成結果の保存完了");

  return {
    success: true,
    result: ideas,
  };
}

/**
 * AppSync Eventsのチャンネル名を取得
 */
export function getOsbornChannel(targetId: number): string {
  return `/osborn-checklist/${targetId}`;
}

/**
 * AppSync Eventsの名前空間を取得
 */
export function getOsbornNamespace(): string {
  return "osborn";
}
