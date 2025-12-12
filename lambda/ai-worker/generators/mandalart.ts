/**
 * マンダラート用 AI生成ロジック
 */
import { eq, and, sql } from "drizzle-orm";
import { GeneratorContext, GeneratorResult } from "./types";

interface MandalartAIResponse {
  isValid: boolean;
  reason: string;
  subThemes: string[];
  ideas: Record<string, string[]>;
}

// サブテーマの位置（中央セクションの周囲8セル）
const subThemePositions = [
  [0, 0], [0, 1], [0, 2],
  [1, 0],         [1, 2],
  [2, 0], [2, 1], [2, 2],
];

// 周囲セルの位置（中央セルを除く）
const surroundingCells = [
  [0, 0], [0, 1], [0, 2],
  [1, 0],         [1, 2],
  [2, 0], [2, 1], [2, 2],
];

// セクションの位置とサブテーマのインデックスのマッピング
const sectionMapping = [
  { section: [0, 0], subThemeIndex: 0 }, // 左上
  { section: [0, 1], subThemeIndex: 1 }, // 上
  { section: [0, 2], subThemeIndex: 2 }, // 右上
  { section: [1, 0], subThemeIndex: 3 }, // 左
  { section: [1, 2], subThemeIndex: 4 }, // 右
  { section: [2, 0], subThemeIndex: 5 }, // 左下
  { section: [2, 1], subThemeIndex: 6 }, // 下
  { section: [2, 2], subThemeIndex: 7 }, // 右下
];

/**
 * マンダラート用AI生成処理
 *
 * マンダラートの構造:
 * - 9x9のグリッド（3x3のセクションが9個）
 * - 中央セクション(1,1)の中央セル(1,1)がメインテーマ
 * - 中央セクション(1,1)の周囲8セルがサブテーマ
 * - 各周囲セクションの中央セルは対応するサブテーマを表示
 * - 各周囲セクションの周囲8セルがアイデア
 */
export async function generateMandalart(ctx: GeneratorContext): Promise<GeneratorResult> {
  const { db, openai, targetId, userId, schemas } = ctx;
  const { mandalarts, mandalart_inputs } = schemas;

  // マンダラートを取得
  const [mandalart] = await db
    .select()
    .from(mandalarts)
    .where(
      and(
        eq(mandalarts.id, targetId),
        eq(mandalarts.user_id, userId)
      )
    )
    .limit(1);

  if (!mandalart) {
    throw new Error("マンダラートが見つかりません");
  }

  // 既存の入力を取得
  const existingInputs = await db
    .select()
    .from(mandalart_inputs)
    .where(eq(mandalart_inputs.mandalart_id, targetId));

  // 既存入力をマップに変換
  const existingMap = new Map<string, { id: number; content: string | null }>();
  for (const input of existingInputs) {
    const key = `${input.section_row_index}-${input.section_column_index}-${input.row_index}-${input.column_index}`;
    existingMap.set(key, { id: input.id, content: input.content });
  }

  // 既存のサブテーマを取得（中央セクションの周囲8セル）
  const existingSubThemes: string[] = [];
  for (const [row, col] of subThemePositions) {
    const key = `1-1-${row}-${col}`;
    const existing = existingMap.get(key);
    existingSubThemes.push(existing?.content || "");
  }

  // 既存のアイデアを取得（各セクションの周囲8セル）
  const existingIdeas: Record<string, string[]> = {};
  for (const { section, subThemeIndex } of sectionMapping) {
    const [sectionRow, sectionCol] = section;
    const ideas: string[] = [];
    for (const [row, col] of surroundingCells) {
      const key = `${sectionRow}-${sectionCol}-${row}-${col}`;
      const existing = existingMap.get(key);
      ideas.push(existing?.content || "");
    }
    existingIdeas[String(subThemeIndex)] = ideas;
  }

  const title = mandalart.title;
  const themeName = mandalart.theme_name;
  const description = mandalart.description || "なし";

  // 現在の入力状況をプロンプト用にフォーマット
  const formatExistingData = () => {
    const lines: string[] = [];

    // サブテーマの状況
    lines.push("【現在のサブテーマ】");
    existingSubThemes.forEach((theme, i) => {
      lines.push(`${i + 1}. ${theme || "(空欄)"}`);
    });

    // 各セクションのアイデアの状況
    lines.push("");
    lines.push("【現在のアイデア】");
    for (let i = 0; i < 8; i++) {
      const subTheme = existingSubThemes[i] || `サブテーマ${i + 1}`;
      const ideas = existingIdeas[String(i)];
      const filledCount = ideas.filter(idea => idea).length;
      lines.push(`\nセクション${i + 1}「${subTheme}」(${filledCount}/8入力済み):`);
      ideas.forEach((idea, j) => {
        lines.push(`  ${j + 1}. ${idea || "(空欄)"}`);
      });
    }

    return lines.join("\n");
  };

  const prompt = `あなたはアイデア発想の専門家です。マンダラートの空欄を埋めてください。

【タイトル】
${title}

【テーマ】
${themeName}

【説明】
${description}

${formatExistingData()}

【お願い】
1. まず、テーマが適切かどうかを判断してください
2. 適切であれば、空欄の部分のみを埋めてください
3. 既に入力済みの項目はそのまま維持してください
4. 各アイデアは30文字以内で簡潔に
5. 具体的で実践可能なアイデアにしてください
6. サブテーマが不適切な場合、そのセクションのアイデアは生成せず空文字にしてください

判断基準（テーマ・サブテーマ・アイデア共通）：
- 意味のある言葉や概念であること
- 無意味な文字列（例：「あああ」「111」など）ではないこと
- アイデア発想が可能な具体性があること
- 不適切な内容（暴力、差別、犯罪、公序良俗に反する内容など）を含まないこと

JSON形式で以下のように出力してください：
{
  "isValid": true または false,
  "reason": "判断理由（日本語で簡潔に）",
  "subThemes": ["サブテーマ1", "サブテーマ2", ..., "サブテーマ8"],
  "ideas": {
    "0": ["アイデア1-1", "アイデア1-2", ..., "アイデア1-8"],
    "1": ["アイデア2-1", "アイデア2-2", ..., "アイデア2-8"],
    ...
    "7": ["アイデア8-1", "アイデア8-2", ..., "アイデア8-8"]
  }
}

重要：
- 既存の入力値がある場合は、その値をそのまま出力に含めてください
- 空欄（"(空欄)"）の部分のみ新しいアイデアを生成してください
- テーマが不適切な場合は、subThemesとideasは空にしてください
- サブテーマが不適切な場合、そのサブテーマはそのまま出力し、対応するセクションのアイデアは全て空文字""にしてください`;

  console.log("OpenAI API呼び出し開始（マンダラート）");
  const startTime = Date.now();

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL!,
    messages: [
      {
        role: "system",
        content:
          "あなたはテーマの妥当性判断とマンダラート法によるアイデア発想の専門家です。JSON形式で回答してください。",
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

  const result = JSON.parse(content) as MandalartAIResponse;

  // テーマが不適切な場合
  if (!result.isValid) {
    return {
      success: false,
      errorMessage: "テーマが適切ではありません",
    };
  }

  const { subThemes, ideas } = result;

  // レスポンスの検証
  if (subThemes.length !== 8) {
    return {
      success: false,
      errorMessage: "AIでのアイデア生成に失敗しました。再度お試しください。",
    };
  }

  for (let i = 0; i < 8; i++) {
    if (!ideas[String(i)] || ideas[String(i)].length !== 8) {
      return {
        success: false,
        errorMessage: "AIでのアイデア生成に失敗しました。再度お試しください。",
      };
    }
  }

  // データベースに保存
  console.log("AI生成結果をデータベースに保存開始");

  // サブテーマを保存（中央セクション 1-1 の周囲8セル）
  for (let i = 0; i < 8; i++) {
    const [row, col] = subThemePositions[i];
    const key = `1-1-${row}-${col}`;
    const existing = existingMap.get(key);
    const subTheme = subThemes[i];

    if (existing) {
      // 既存の入力が空でない場合はスキップ
      if (existing.content && existing.content.trim() !== "") {
        continue;
      }
      await db
        .update(mandalart_inputs)
        .set({ content: subTheme, updated_at: sql`NOW()` })
        .where(eq(mandalart_inputs.id, existing.id));
    } else {
      await db.insert(mandalart_inputs).values({
        mandalart_id: targetId,
        section_row_index: 1,
        section_column_index: 1,
        row_index: row,
        column_index: col,
        content: subTheme,
      });
    }
  }

  // 周囲8セクションのアイデアを保存
  for (const { section, subThemeIndex } of sectionMapping) {
    const [sectionRow, sectionCol] = section;
    const sectionIdeas = ideas[String(subThemeIndex)];

    for (let i = 0; i < 8; i++) {
      const [row, col] = surroundingCells[i];
      const key = `${sectionRow}-${sectionCol}-${row}-${col}`;
      const existing = existingMap.get(key);
      const idea = sectionIdeas[i];

      if (existing) {
        // 既存の入力が空でない場合はスキップ
        if (existing.content && existing.content.trim() !== "") {
          continue;
        }
        await db
          .update(mandalart_inputs)
          .set({ content: idea, updated_at: sql`NOW()` })
          .where(eq(mandalart_inputs.id, existing.id));
      } else {
        await db.insert(mandalart_inputs).values({
          mandalart_id: targetId,
          section_row_index: sectionRow,
          section_column_index: sectionCol,
          row_index: row,
          column_index: col,
          content: idea,
        });
      }
    }
  }

  console.log("AI生成結果の保存完了");

  return {
    success: true,
    result: { subThemes, ideas },
  };
}

/**
 * AppSync Eventsのチャンネル名を取得
 */
export function getMandalartChannel(targetId: number): string {
  return `/mandalart/${targetId}`;
}

/**
 * AppSync Eventsの名前空間を取得
 */
export function getMandalartNamespace(): string {
  return "mandalart";
}
