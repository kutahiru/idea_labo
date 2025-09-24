import { db } from "@/db";
import { brainwritings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { BrainwritingListItem } from "@/types/brainwriting";

// ブレインライティング一覧取得（共通ロジック）
export async function getBrainwritingsByUserId(userId: string): Promise<BrainwritingListItem[]> {
  return await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.user_id, userId))
    .orderBy(desc(brainwritings.created_at));
}