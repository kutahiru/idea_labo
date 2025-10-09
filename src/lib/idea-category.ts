import { db } from "@/db";
import { idea_categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { IdeaCategoryListItem } from "@/types/idea-category";
import { IdeaCategoryFormData } from "@/schemas/idea-category";

/** 一覧取得 */
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

/** 新規作成 */
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

/** 更新 */
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

/** 削除 */
export async function deleteIdeaCategory(id: number, userId: string) {
  const result = await db
    .delete(idea_categories)
    .where(and(eq(idea_categories.id, id), eq(idea_categories.user_id, userId)))
    .returning({ id: idea_categories.id });

  return result[0];
}

/** カテゴリ所有者確認 */
export async function checkCategoryOwnership(categoryId: number, userId: string): Promise<boolean> {
  const result = await db
    .select({
      id: idea_categories.id,
    })
    .from(idea_categories)
    .where(and(eq(idea_categories.id, categoryId), eq(idea_categories.user_id, userId)))
    .limit(1);

  return result.length > 0;
}
