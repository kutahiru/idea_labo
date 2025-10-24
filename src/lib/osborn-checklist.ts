/**
 * オズボーンのチェックリスト機能のデータアクセス層
 * オズボーンのCRUD操作を提供します。
 */

import { db } from "@/db";
import { osborn_checklists, osborn_checklist_inputs } from "@/db/schema";
import { OsbornChecklistListItem, OsbornChecklistInputData } from "@/types/osborn-checklist";
import { OsbornChecklistFormData, OsbornChecklistType } from "@/schemas/osborn-checklist";
import { desc, eq, and, sql } from "drizzle-orm";

//#region ユーザーIDに紐づくオズボーンの一覧を取得
/**
 * ユーザーIDに紐づくオズボーンの一覧を取得
 * @param userId - ユーザーID
 * @returns オズボーンの一覧
 */
export async function getOsbornChecklistsByUserId(
  userId: string
): Promise<OsbornChecklistListItem[]> {
  return await db
    .select({
      id: osborn_checklists.id,
      userId: osborn_checklists.user_id,
      title: osborn_checklists.title,
      themeName: osborn_checklists.theme_name,
      description: osborn_checklists.description,
      createdAt: osborn_checklists.created_at,
    })
    .from(osborn_checklists)
    .where(eq(osborn_checklists.user_id, userId))
    .orderBy(desc(osborn_checklists.id));
}
//#endregion

//#region オズボーンの新規作成
/**
 * オズボーンの新規作成
 * @param userId - ユーザーID
 * @param data - フォームデータ
 * @returns 作成された情報
 */
export async function createOsbornChecklist(userId: string, data: OsbornChecklistFormData) {
  return await db.transaction(async tx => {
    const result = await tx
      .insert(osborn_checklists)
      .values({
        user_id: userId,
        title: data.title,
        theme_name: data.themeName,
        description: data.description,
      })
      .returning({
        id: osborn_checklists.id,
        title: osborn_checklists.title,
        themeName: osborn_checklists.theme_name,
        description: osborn_checklists.description,
        createdAt: osborn_checklists.created_at,
      });

    return result[0];
  });
}
//#endregion

//#region オズボーンの更新
/**
 * オズボーンの更新
 * @param id - オズボーンID
 * @param userId - ユーザーID
 * @param data - 更新するフォームデータ
 * @returns 更新された情報
 */
export async function updateOsbornChecklist(
  id: number,
  userId: string,
  data: Partial<OsbornChecklistFormData>
) {
  const result = await db
    .update(osborn_checklists)
    .set({
      title: data.title,
      theme_name: data.themeName,
      description: data.description,
      updated_at: sql`NOW()`,
    })
    .where(and(eq(osborn_checklists.id, id), eq(osborn_checklists.user_id, userId)))
    .returning({
      id: osborn_checklists.id,
      title: osborn_checklists.title,
      themeName: osborn_checklists.theme_name,
      description: osborn_checklists.description,
      createdAt: osborn_checklists.created_at,
    });

  return result[0];
}
//#endregion

//#region オズボーンの削除
/**
 * オズボーンの削除
 * @param id - オズボーンID
 * @param userId - ユーザーID
 * @returns 削除されたオズボーンのID
 */
export async function deleteOsbornChecklist(id: number, userId: string) {
  const result = await db
    .delete(osborn_checklists)
    .where(and(eq(osborn_checklists.id, id), eq(osborn_checklists.user_id, userId)))
    .returning({ id: osborn_checklists.id });

  return result[0];
}
//#endregion

//#region オズボーンのチェックリストの単一取得
/**
 * オズボーンのチェックリストの単一取得
 * @param id - オズボーンのチェックリストID
 * @param userId - ユーザーID
 * @returns オズボーンのチェックリスト情報
 */
export async function getOsbornChecklistById(id: number, userId: string) {
  const result = await db
    .select({
      id: osborn_checklists.id,
      userId: osborn_checklists.user_id,
      title: osborn_checklists.title,
      themeName: osborn_checklists.theme_name,
      description: osborn_checklists.description,
      createdAt: osborn_checklists.created_at,
    })
    .from(osborn_checklists)
    .where(and(eq(osborn_checklists.id, id), eq(osborn_checklists.user_id, userId)))
    .limit(1);

  return result[0];
}
//#endregion

//#region オズボーンの詳細の取得（入力データ含む）
/**
 * オズボーン詳細の取得（入力データ含む）
 * @param osbornChecklistId - オズボーンID
 * @param userId - ユーザーID
 * @returns オズボーン詳細情報
 */
export async function getOsbornChecklistDetailById(osbornChecklistId: number, userId: string) {
  // 基本情報取得
  const osbornChecklist = await getOsbornChecklistById(osbornChecklistId, userId);
  if (!osbornChecklist) {
    return null;
  }

  // 入力データ取得
  const inputs = await getOsbornChecklistInputsByOsbornChecklistId(osbornChecklistId);

  return {
    ...osbornChecklist,
    inputs,
  };
}
//#endregion

//#region オズボーン入力データの取得
/**
 * オズボーン入力データの取得
 * @param osbornChecklistId - オズボーンID
 * @returns オズボーン入力データの一覧
 */
export async function getOsbornChecklistInputsByOsbornChecklistId(
  osbornChecklistId: number
): Promise<OsbornChecklistInputData[]> {
  const results = await db
    .select({
      id: osborn_checklist_inputs.id,
      osborn_checklist_id: osborn_checklist_inputs.osborn_checklist_id,
      checklist_type: osborn_checklist_inputs.checklist_type,
      content: osborn_checklist_inputs.content,
      created_at: osborn_checklist_inputs.created_at,
      updated_at: osborn_checklist_inputs.updated_at,
    })
    .from(osborn_checklist_inputs)
    .where(eq(osborn_checklist_inputs.osborn_checklist_id, osbornChecklistId))
    .orderBy(osborn_checklist_inputs.id);

  return results as OsbornChecklistInputData[];
}
//#endregion

//#region オズボーン入力データの保存・更新
/**
 * オズボーン入力データの保存・更新
 * @param osbornChecklistId - オズボーンID
 * @param userId - ユーザーID
 * @param checklistType - チェックリストの種類
 * @param content - 入力内容
 * @returns 保存・更新された入力データ
 */
export async function upsertOsbornChecklistInput(
  osbornChecklistId: number,
  userId: string,
  checklistType: OsbornChecklistType,
  content: string
) {
  // オズボーンの所有者チェック
  const osbornChecklist = await getOsbornChecklistById(osbornChecklistId, userId);
  if (!osbornChecklist) {
    throw new Error("Unauthorized: OsbornChecklist not found or access denied");
  }

  // 既存データを検索
  const existingInput = await db
    .select()
    .from(osborn_checklist_inputs)
    .where(
      and(
        eq(osborn_checklist_inputs.osborn_checklist_id, osbornChecklistId),
        eq(osborn_checklist_inputs.checklist_type, checklistType)
      )
    )
    .limit(1);

  if (existingInput.length > 0) {
    // 更新
    const result = await db
      .update(osborn_checklist_inputs)
      .set({
        content: content || null,
        updated_at: sql`NOW()`,
      })
      .where(eq(osborn_checklist_inputs.id, existingInput[0].id))
      .returning();

    return result[0];
  } else {
    // 新規作成
    const result = await db
      .insert(osborn_checklist_inputs)
      .values({
        osborn_checklist_id: osbornChecklistId,
        checklist_type: checklistType,
        content: content || null,
      })
      .returning();

    return result[0];
  }
}
//#endregion
