import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UserProfile } from "@/types/user";
import { UserFormData } from "@/schemas/user";

/** ユーザー情報取得 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      created_at: users.created_at,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
}

/** ユーザー情報更新 */
export async function updateUser(userId: string, data: UserFormData) {
  const result = await db
    .update(users)
    .set({
      name: data.name,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      created_at: users.created_at,
    });

  return result[0];
}
