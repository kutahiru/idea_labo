/**
 * ユーザー機能のデータアクセス層
 * ユーザー情報の取得・更新などを提供します。
 */

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { UserProfile } from "@/types/user";
import { UserFormData } from "@/schemas/user";

//#region ユーザー情報取得
/**
 * ユーザー情報取得
 * @param userId - ユーザーID
 * @returns ユーザー情報
 */
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
//#endregion

//#region ユーザー情報更新
/**
 * ユーザー情報更新
 * @param userId - ユーザーID
 * @param data - ユーザーのフォームデータ
 * @returns 更新されたユーザー情報
 */
export async function updateUser(userId: string, data: UserFormData) {
  const result = await db
    .update(users)
    .set({
      name: data.name,
      updated_at: sql`NOW()`,
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
//#endregion
