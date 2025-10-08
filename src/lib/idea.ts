import { db } from "@/db";
import { ideas, idea_categories } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { IdeaListItem } from "@/types/idea";
import { IdeaFormData } from "@/schemas/idea";

/** アイデア一覧取得（カテゴリID条件） */
export async function getIdeasByCategoryId(categoryId: number, userId: string): Promise<IdeaListItem[]> {
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

/** 新規作成 */
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

/** 更新 */
export async function updateIdea(
  id: number,
  categoryId: number,
  data: Partial<IdeaFormData>
) {
  const result = await db
    .update(ideas)
    .set({
      name: data.name,
      description: data.description || null,
      priority: data.priority || "medium",
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

/** 削除 */
export async function deleteIdea(id: number) {
  const result = await db
    .delete(ideas)
    .where(eq(ideas.id, id))
    .returning({ id: ideas.id });

  return result[0];
}

/** アイデアの所有者チェック（カテゴリ経由） */
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
