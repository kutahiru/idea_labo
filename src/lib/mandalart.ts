/**
 * マンダラート機能のデータアクセス層
 * マンダラートのCRUD操作、シート管理、入力データ管理、参加者管理などを提供します。
 */

import { db } from "@/db";
import { mandalart_inputs, mandalarts } from "@/db/schema";
import { MandalartInputData, MandalartListItem } from "@/types/mandalart";
import { MandalartFormData } from "@/schemas/mandalart";
import { desc, eq, and, sql } from "drizzle-orm";
import { generateToken } from "@/lib/token";

//#region ユーザーIDに紐づくマンダラートの一覧を取得
/**
 * ユーザーIDに紐づくマンダラートの一覧を取得
 * @param userId - ユーザーID
 * @returns マンダラートの一覧
 */
export async function getMandalartsByUserId(userId: string): Promise<MandalartListItem[]> {
  return await db
    .select({
      id: mandalarts.id,
      userId: mandalarts.user_id,
      title: mandalarts.title,
      themeName: mandalarts.theme_name,
      description: mandalarts.description,
      createdAt: mandalarts.created_at,
    })
    .from(mandalarts)
    .where(eq(mandalarts.user_id, userId))
    .orderBy(desc(mandalarts.id));
}
//#endregion

//#region マンダラートの新規作成
/**
 * マンダラートの新規作成
 * @param userId - ユーザーID
 * @param data - フォームデータ
 * @returns 作成された情報
 */
export async function createMandalart(userId: string, data: MandalartFormData) {
  // 公開トークンを生成
  const publicToken = generateToken();

  return await db.transaction(async tx => {
    const result = await tx
      .insert(mandalarts)
      .values({
        user_id: userId,
        title: data.title,
        theme_name: data.themeName,
        description: data.description,
        public_token: publicToken,
      })
      .returning({
        id: mandalarts.id,
        title: mandalarts.title,
        themeName: mandalarts.theme_name,
        description: mandalarts.description,
        createdAt: mandalarts.created_at,
      });

    return result[0];
  });
}
//#endregion

//#region マンダラートの更新
/**
 * マンダラートの更新
 * @param id - マンダラートID
 * @param userId - ユーザーID
 * @param data - 更新するフォームデータ
 * @returns 更新された情報
 */
export async function updateMandalart(
  id: number,
  userId: string,
  data: Partial<MandalartFormData>
) {
  const result = await db
    .update(mandalarts)
    .set({
      title: data.title,
      theme_name: data.themeName,
      description: data.description,
      updated_at: sql`NOW()`,
    })
    .where(and(eq(mandalarts.id, id), eq(mandalarts.user_id, userId)))
    .returning({
      id: mandalarts.id,
      title: mandalarts.title,
      themeName: mandalarts.theme_name,
      description: mandalarts.description,
      createdAt: mandalarts.created_at,
    });

  return result[0];
}
//#endregion

//#region マンダラートの削除
/**
 * マンダラートの削除
 * @param id - マンダラートID
 * @param userId - ユーザーID
 * @returns 削除されたマンダラートのID
 */
export async function deleteMandalart(id: number, userId: string) {
  const result = await db
    .delete(mandalarts)
    .where(and(eq(mandalarts.id, id), eq(mandalarts.user_id, userId)))
    .returning({ id: mandalarts.id });

  return result[0];
}
//#endregion

//#region マンダラートの単一取得
/**
 * マンダラートの単一取得
 * @param id - マンダラートID
 * @param userId - ユーザーID
 * @returns マンダラート情報
 */
export async function getMandalartById(id: number, userId: string) {
  const result = await db
    .select({
      id: mandalarts.id,
      userId: mandalarts.user_id,
      title: mandalarts.title,
      themeName: mandalarts.theme_name,
      description: mandalarts.description,
      publicToken: mandalarts.public_token,
      isResultsPublic: mandalarts.is_results_public,
      createdAt: mandalarts.created_at,
    })
    .from(mandalarts)
    .where(and(eq(mandalarts.id, id), eq(mandalarts.user_id, userId)))
    .limit(1);

  return result[0];
}
//#endregion

//#region マンダラートの詳細の取得（入力データ含む）
/**
 * マンダラート詳細の取得（全シート、ユーザー、入力データ含む）
 * @param mandalartId - マンダラートID
 * @param userId - ユーザーID
 * @returns マンダラート詳細情報
 */
export async function getMandalartDetailById(mandalartId: number, userId: string) {
  // 基本情報取得
  const mandalart = await getMandalartById(mandalartId, userId);
  if (!mandalart) {
    return null;
  }

  // 入力データ取得
  const inputs = await getMandalartInputsByMandalartId(mandalartId);

  return {
    ...mandalart,
    inputs,
  };
}
//#endregion

//#region マンダラートの詳細の取得（公開トークン条件）
/**
 * マンダラート詳細の取得（公開トークン条件）
 * @param token - 公開トークン
 * @returns マンダラート詳細情報（公開されていない場合はnull）
 */
export async function getMandalartDetailByToken(token: string) {
  // トークンでマンダラート基本情報を取得（公開されているもののみ）
  const result = await db
    .select({
      id: mandalarts.id,
      userId: mandalarts.user_id,
      title: mandalarts.title,
      themeName: mandalarts.theme_name,
      description: mandalarts.description,
      publicToken: mandalarts.public_token,
      isResultsPublic: mandalarts.is_results_public,
      createdAt: mandalarts.created_at,
    })
    .from(mandalarts)
    .where(
      and(
        eq(mandalarts.public_token, token),
        eq(mandalarts.is_results_public, true)
      )
    )
    .limit(1);

  const mandalart = result[0];

  // 見つからない場合はnull
  if (!mandalart) {
    return null;
  }

  // 入力データ取得
  const inputs = await getMandalartInputsByMandalartId(mandalart.id);

  return {
    ...mandalart,
    inputs,
  };
}
//#endregion

//#region マンダラート入力データの取得（マンダラートID条件）
/**
 * マンダラート入力データの取得（マンダラートID条件）
 * @param mandalartId - マンダラートID
 * @returns マンダラート入力データの一覧
 */
export async function getMandalartInputsByMandalartId(
  mandalartId: number
): Promise<MandalartInputData[]> {
  return await db
    .select({
      id: mandalart_inputs.id,
      mandalart_id: mandalart_inputs.mandalart_id,
      section_row_index: mandalart_inputs.section_row_index,
      section_column_index: mandalart_inputs.section_column_index,
      row_index: mandalart_inputs.row_index,
      column_index: mandalart_inputs.column_index,
      content: mandalart_inputs.content,
      created_at: mandalart_inputs.created_at,
      updated_at: mandalart_inputs.updated_at,
    })
    .from(mandalart_inputs)
    .where(eq(mandalart_inputs.mandalart_id, mandalartId))
    .orderBy(mandalart_inputs.id);
}
//#endregion

//#region マンダラート入力データの保存・更新
/**
 * マンダラート入力データの保存・更新
 * @param mandalartId - マンダラートID
 * @param sectionRowIndex - セクション行インデックス
 * @param sectionColumnIndex - セクション列インデックス
 * @param rowIndex - セル行インデックス
 * @param columnIndex - セル列インデックス
 * @param content - 入力内容
 * @returns 保存・更新された入力データ
 */
export async function upsertMandalartInput(
  mandalartId: number,
  userId: string,
  sectionRowIndex: number,
  sectionColumnIndex: number,
  rowIndex: number,
  columnIndex: number,
  content: string
) {
  // マンダラートの所有者チェック
  const mandalart = await getMandalartById(mandalartId, userId);
  if (!mandalart) {
    throw new Error("Unauthorized: Mandalart not found or access denied");
  }

  // 既存データを検索
  const existingInput = await db
    .select()
    .from(mandalart_inputs)
    .where(
      and(
        eq(mandalart_inputs.mandalart_id, mandalartId),
        eq(mandalart_inputs.section_row_index, sectionRowIndex),
        eq(mandalart_inputs.section_column_index, sectionColumnIndex),
        eq(mandalart_inputs.row_index, rowIndex),
        eq(mandalart_inputs.column_index, columnIndex)
      )
    )
    .limit(1);

  if (existingInput.length > 0) {
    // 更新
    const result = await db
      .update(mandalart_inputs)
      .set({
        content: content || null,
        updated_at: sql`NOW()`,
      })
      .where(eq(mandalart_inputs.id, existingInput[0].id))
      .returning();

    return result[0];
  } else {
    // 新規作成
    const result = await db
      .insert(mandalart_inputs)
      .values({
        mandalart_id: mandalartId,
        section_row_index: sectionRowIndex,
        section_column_index: sectionColumnIndex,
        row_index: rowIndex,
        column_index: columnIndex,
        content: content || null,
      })
      .returning();

    return result[0];
  }
}
//#endregion

//#region マンダラートの結果公開フラグの更新
/**
 * マンダラートの結果公開フラグの更新
 * @param mandalartId - マンダラートID
 * @param userId - ユーザーID
 * @param isResultsPublic - 結果公開フラグ
 */
export async function updateMandalartIsResultsPublic(
  mandalartId: number,
  userId: string,
  isResultsPublic: boolean
) {
  await db
    .update(mandalarts)
    .set({
      is_results_public: isResultsPublic,
      updated_at: sql`NOW()`,
    })
    .where(and(eq(mandalarts.id, mandalartId), eq(mandalarts.user_id, userId)));
}
//#endregion
