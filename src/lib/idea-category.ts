/**
 * アイデアカテゴリ機能のデータアクセス層
 * アイデアカテゴリのCRUD操作、所有者確認などを提供します。
 */

import { db } from "@/db";
import { idea_categories } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { IdeaCategoryListItem } from "@/types/idea-category";
import { IdeaCategoryFormData } from "@/schemas/idea-category";

//#region ユーザーIDに紐づくアイデアカテゴリの一覧を取得
/**
 * ユーザーIDに紐づくアイデアカテゴリの一覧を取得
 * @param userId - ユーザーID
 * @returns アイデアカテゴリの一覧
 */
export async function getIdeaCategoriesByUserId(userId: string): Promise<IdeaCategoryListItem[]> {
  const categories = await db
    .select({
      id: idea_categories.id,
      name: idea_categories.name,
      description: idea_categories.description,
      created_at: idea_categories.created_at,
    })
    .from(idea_categories)
    .where(eq(idea_categories.user_id, userId))
    .orderBy(desc(idea_categories.id));

  return categories;
}
//#endregion

//#region アイデアカテゴリの新規作成
/**
 * アイデアカテゴリの新規作成
 * @param userId - ユーザーID
 * @param data - アイデアカテゴリのフォームデータ
 * @returns 作成されたアイデアカテゴリ情報
 */
export async function createIdeaCategory(userId: string, data: IdeaCategoryFormData) {
  const result = await db
    .insert(idea_categories)
    .values({
      user_id: userId,
      name: data.name,
      description: data.description || null,
    })
    .returning({
      id: idea_categories.id,
      name: idea_categories.name,
      description: idea_categories.description,
      created_at: idea_categories.created_at,
    });

  return result[0];
}
//#endregion

//#region アイデアカテゴリの更新
/**
 * アイデアカテゴリの更新
 * @param id - アイデアカテゴリID
 * @param userId - ユーザーID
 * @param data - 更新するアイデアカテゴリのフォームデータ
 * @returns 更新されたアイデアカテゴリ情報
 */
export async function updateIdeaCategory(
  id: number,
  userId: string,
  data: Partial<IdeaCategoryFormData>
) {
  const result = await db
    .update(idea_categories)
    .set({
      name: data.name,
      description: data.description || null,
      updated_at: sql`NOW()`,
    })
    .where(and(eq(idea_categories.id, id), eq(idea_categories.user_id, userId)))
    .returning({
      id: idea_categories.id,
      name: idea_categories.name,
      description: idea_categories.description,
      created_at: idea_categories.created_at,
    });

  return result[0];
}
//#endregion

//#region アイデアカテゴリの削除
/**
 * アイデアカテゴリの削除
 * @param id - アイデアカテゴリID
 * @param userId - ユーザーID
 * @returns 削除されたアイデアカテゴリのID
 */
export async function deleteIdeaCategory(id: number, userId: string) {
  const result = await db
    .delete(idea_categories)
    .where(and(eq(idea_categories.id, id), eq(idea_categories.user_id, userId)))
    .returning({ id: idea_categories.id });

  return result[0];
}
//#endregion

//#region カテゴリ所有者確認
/**
 * カテゴリ所有者確認
 * @param categoryId - カテゴリID
 * @param userId - ユーザーID
 * @returns 所有者かどうか
 */
export async function checkCategoryOwnership(categoryId: number, userId: string): Promise<boolean> {
  const result = await db
    .select({
      id: idea_categories.id,
    })
    .from(idea_categories)
    .where(and(eq(idea_categories.id, categoryId), eq(idea_categories.user_id, userId)));

  return result.length > 0;
}
//#endregion

//#region カテゴリ情報取得
/**
 * カテゴリ情報を取得（所有者確認付き）
 * @param categoryId - カテゴリID
 * @param userId - ユーザーID
 * @returns カテゴリ情報（所有者でない場合はnull）
 */
export async function getCategoryById(categoryId: number, userId: string) {
  const result = await db
    .select({
      id: idea_categories.id,
      name: idea_categories.name,
      description: idea_categories.description,
    })
    .from(idea_categories)
    .where(and(eq(idea_categories.id, categoryId), eq(idea_categories.user_id, userId)));

  return result[0] || null;
}
//#endregion
