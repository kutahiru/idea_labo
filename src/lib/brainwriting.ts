import { db } from "@/db";
import { brainwritings } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { BrainwritingListItem, BrainwritingFormData } from "@/types/brainwriting";

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

  return result[0];
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
      updated_at: new Date(),
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
