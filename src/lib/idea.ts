/**
 * アイデア機能のデータアクセス層
 * アイデアのCRUD操作、所有者確認などを提供します。
 */

import { db } from "@/db";
import { ideas, idea_categories } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { IdeaListItem } from "@/types/idea";
import { IdeaFormData } from "@/schemas/idea";

//#region カテゴリIDに紐づくアイデアの一覧を取得
/**
 * カテゴリIDに紐づくアイデアの一覧を取得
 * @param categoryId - カテゴリID
 * @param userId - ユーザーID
 * @returns アイデアの一覧
 */
export async function getIdeasByCategoryId(
  categoryId: number,
  userId: string
): Promise<IdeaListItem[]> {
  const ideaList = await db
    .select({
      id: ideas.id,
      name: ideas.name,
      description: ideas.description,
      priority: ideas.priority,
      created_at: ideas.created_at,
    })
    .from(ideas)
    .innerJoin(idea_categories, eq(ideas.idea_category_id, idea_categories.id))
    .where(and(eq(ideas.idea_category_id, categoryId), eq(idea_categories.user_id, userId)))
    .orderBy(desc(ideas.id));

  return ideaList as IdeaListItem[];
}
//#endregion

//#region アイデアの新規作成
/**
 * アイデアの新規作成
 * @param categoryId - カテゴリID
 * @param data - アイデアのフォームデータ
 * @returns 作成されたアイデア情報
 */
export async function createIdea(categoryId: number, data: IdeaFormData) {
  const result = await db
    .insert(ideas)
    .values({
      idea_category_id: categoryId,
      name: data.name,
      description: data.description || null,
      priority: data.priority || "medium",
    })
    .returning({
      id: ideas.id,
      name: ideas.name,
      description: ideas.description,
      priority: ideas.priority,
      created_at: ideas.created_at,
    });

  return result[0];
}
//#endregion

//#region アイデアの更新
/**
 * アイデアの更新
 * @param id - アイデアID
 * @param categoryId - カテゴリID
 * @param data - 更新するアイデアのフォームデータ
 * @returns 更新されたアイデア情報
 */
export async function updateIdea(id: number, categoryId: number, data: Partial<IdeaFormData>) {
  const result = await db
    .update(ideas)
    .set({
      name: data.name,
      description: data.description || null,
      priority: data.priority || "medium",
      updated_at: sql`NOW()`,
    })
    .where(and(eq(ideas.id, id), eq(ideas.idea_category_id, categoryId)))
    .returning({
      id: ideas.id,
      name: ideas.name,
      description: ideas.description,
      priority: ideas.priority,
      created_at: ideas.created_at,
    });

  return result[0];
}
//#endregion

//#region アイデアの削除
/**
 * アイデアの削除
 * @param id - アイデアID
 * @returns 削除されたアイデアのID
 */
export async function deleteIdea(id: number) {
  const result = await db.delete(ideas).where(eq(ideas.id, id)).returning({ id: ideas.id });

  return result[0];
}
//#endregion

//#region アイデアの所有者チェック
/**
 * アイデアの所有者チェック（カテゴリ経由）
 * @param ideaId - アイデアID
 * @param userId - ユーザーID
 * @returns 所有者かどうか
 */
export async function checkIdeaOwnership(ideaId: number, userId: string): Promise<boolean> {
  const result = await db
    .select({
      id: ideas.id,
    })
    .from(ideas)
    .innerJoin(idea_categories, eq(ideas.idea_category_id, idea_categories.id))
    .where(and(eq(ideas.id, ideaId), eq(idea_categories.user_id, userId)))
    .limit(1);

  return result.length > 0;
}
//#endregion
