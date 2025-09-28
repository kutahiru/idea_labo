import { db } from "@/db";
import { brainwritings, brainwriting_sheets, brainwriting_inputs, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { BrainwritingListItem, BrainwritingFormData } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";

// ブレインライティング一覧取得
export async function getBrainwritingsByUserId(userId: string): Promise<BrainwritingListItem[]> {
  return await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.user_id, userId))
    .orderBy(desc(brainwritings.created_at));
}

// ブレインライティング新規作成
export async function createBrainwriting(userId: string, data: BrainwritingFormData) {
  const result = await db
    .insert(brainwritings)
    .values({
      user_id: userId,
      title: data.title,
      theme_name: data.themeName,
      description: data.description,
      usage_scope: data.usageScope,
    })
    .returning({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      createdAt: brainwritings.created_at,
    });

  const brainwriting = result[0];

  // X投稿版の場合、brainwriting_sheetsを自動生成
  if (data.usageScope === USAGE_SCOPE.XPOST) {
    await db.insert(brainwriting_sheets).values({
      brainwriting_id: brainwriting.id,
      current_user_id: userId,
    });
  }

  return brainwriting;
}

// ブレインライティング更新
export async function updateBrainwriting(
  id: number,
  userId: string,
  data: Partial<BrainwritingFormData>
) {
  const result = await db
    .update(brainwritings)
    .set({
      title: data.title,
      theme_name: data.themeName,
      description: data.description,
      usage_scope: data.usageScope,
    })
    .where(and(eq(brainwritings.id, id), eq(brainwritings.user_id, userId))) // 所有者チェック
    .returning({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      createdAt: brainwritings.created_at,
    });

  return result[0];
}

// ブレインライティング削除
export async function deleteBrainwriting(id: number, userId: string) {
  const result = await db
    .delete(brainwritings)
    .where(and(eq(brainwritings.id, id), eq(brainwritings.user_id, userId))) // 所有者チェック
    .returning({ id: brainwritings.id });

  return result[0];
}

// 単一のブレインライティング取得
export async function getBrainwritingById(id: number, userId: string) {
  const result = await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(and(eq(brainwritings.id, id), eq(brainwritings.user_id, userId))) // 所有者チェック
    .limit(1);

  return result[0];
}

// ブレインライティング入力データ作成・更新
export async function upsertBrainwritingInput(
  brainwritingId: number,
  brainwritingSheetId: number,
  inputUserId: string,
  rowIndex: number,
  columnIndex: number,
  content: string
) {
  // 既存の入力があるかチェック
  const existingInput = await db
    .select()
    .from(brainwriting_inputs)
    .where(
      and(
        eq(brainwriting_inputs.brainwriting_id, brainwritingId),
        eq(brainwriting_inputs.brainwriting_sheet_id, brainwritingSheetId),
        eq(brainwriting_inputs.row_index, rowIndex),
        eq(brainwriting_inputs.column_index, columnIndex)
      )
    )
    .limit(1);

  if (existingInput.length > 0) {
    // 更新
    const result = await db
      .update(brainwriting_inputs)
      .set({
        content: content,
        input_user_id: inputUserId,
      })
      .where(eq(brainwriting_inputs.id, existingInput[0].id))
      .returning();

    return result[0];
  } else {
    // 新規作成
    const result = await db
      .insert(brainwriting_inputs)
      .values({
        brainwriting_id: brainwritingId,
        brainwriting_sheet_id: brainwritingSheetId,
        input_user_id: inputUserId,
        row_index: rowIndex,
        column_index: columnIndex,
        content: content,
      })
      .returning();

    return result[0];
  }
}

// ブレインライティングシート全件取得
export async function getBrainwritingSheetsByBrainwritingId(brainwritingId: number) {
  return await db
    .select()
    .from(brainwriting_sheets)
    .where(eq(brainwriting_sheets.brainwriting_id, brainwritingId));
}

// ブレインライティング入力データ取得（ユーザー名含む）
export async function getBrainwritingInputsBySheetId(brainwritingSheetId: number) {
  return await db
    .select({
      id: brainwriting_inputs.id,
      brainwriting_id: brainwriting_inputs.brainwriting_id,
      brainwriting_sheet_id: brainwriting_inputs.brainwriting_sheet_id,
      input_user_id: brainwriting_inputs.input_user_id,
      input_user_name: users.name,
      row_index: brainwriting_inputs.row_index,
      column_index: brainwriting_inputs.column_index,
      content: brainwriting_inputs.content,
      created_at: brainwriting_inputs.created_at,
      updated_at: brainwriting_inputs.updated_at,
    })
    .from(brainwriting_inputs)
    .leftJoin(users, eq(brainwriting_inputs.input_user_id, users.id))
    .where(eq(brainwriting_inputs.brainwriting_sheet_id, brainwritingSheetId));
}

// ブレインライティング詳細取得（シート・入力データ含む）
export async function getBrainwritingDetailById(id: number, userId: string) {
  // 基本情報取得
  const brainwriting = await getBrainwritingById(id, userId);
  if (!brainwriting) {
    return null;
  }

  // 全シート取得
  const sheets = await getBrainwritingSheetsByBrainwritingId(id);

  // 全シートの入力データ取得
  const inputs = [];
  for (const sheet of sheets) {
    const sheetInputs = await getBrainwritingInputsBySheetId(sheet.id);
    inputs.push(...sheetInputs);
  }

  return {
    ...brainwriting,
    sheets,
    inputs
  };
}
