import { NextRequest, NextResponse } from "next/server";
import { apiErrors, validateIdRequest } from "@/lib/api/utils";
import { db } from "@/db";
import { osborn_checklists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";
import { OSBORN_CHECKLIST_TYPES } from "@/schemas/osborn-checklist";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 50 * 1000, // 50秒のタイムアウト
});

// API Routeの最大実行時間を60秒に設定（Vercel Hobbyプランでは10秒が上限）
export const maxDuration = 60;

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // OpenAIモデルの環境変数チェック
    if (!process.env.OPENAI_MODEL) {
      throw new Error("OPENAI_MODEL environment variable is not set");
    }

    // 認証チェックとIDバリデーション
    const validateResult = await validateIdRequest(params);
    if ("error" in validateResult) {
      return validateResult.error;
    }

    const { userId, id: osbornChecklistId } = validateResult;

    // データベースからオズボーンのチェックリストを取得
    const [osbornChecklist] = await db
      .select()
      .from(osborn_checklists)
      .where(
        and(eq(osborn_checklists.id, osbornChecklistId), eq(osborn_checklists.user_id, userId))
      );

    if (!osbornChecklist) {
      return apiErrors.notFound("オズボーンのチェックリスト");
    }

    // OpenAI APIを使用してテーマの妥当性チェックとアイデア生成を1回で実行
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
      model: process.env.OPENAI_MODEL,
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
      console.error("AI応答が空です");
      return apiErrors.serverError();
    }

    const result = JSON.parse(content);

    // テーマが不適切な場合はエラーを返す
    if (!result.isValid) {
      return NextResponse.json(
        { error: `テーマが適切ではありません: ${result.reason}` },
        { status: 400 }
      );
    }

    const ideas = result.ideas;

    // レスポンスの検証：必要なキーがすべて含まれているか確認
    const requiredKeys = [
      OSBORN_CHECKLIST_TYPES.TRANSFER,
      OSBORN_CHECKLIST_TYPES.APPLY,
      OSBORN_CHECKLIST_TYPES.MODIFY,
      OSBORN_CHECKLIST_TYPES.MAGNIFY,
      OSBORN_CHECKLIST_TYPES.MINIFY,
      OSBORN_CHECKLIST_TYPES.SUBSTITUTE,
      OSBORN_CHECKLIST_TYPES.REARRANGE,
      OSBORN_CHECKLIST_TYPES.REVERSE,
      OSBORN_CHECKLIST_TYPES.COMBINE,
    ];

    const missingKeys = requiredKeys.filter(key => !ideas[key]);
    if (missingKeys.length > 0) {
      console.error("AI応答に必要なキーが不足しています:", missingKeys);
      return apiErrors.serverError();
    }

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("AI生成エラー:", error);
    return apiErrors.serverError();
  }
}
