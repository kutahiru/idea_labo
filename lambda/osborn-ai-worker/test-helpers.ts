/**
 * テストヘルパー関数
 * テストデータの作成・削除を簡単にする
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, integer, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";

// DB Schema定義（index.tsと同じ）
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});
export const osborn_checklists = pgTable("osborn_checklists", {
  id: serial("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  theme_name: varchar("theme_name", { length: 100 }).notNull(),
  description: varchar("description", { length: 1000 }),
  public_token: varchar("public_token", { length: 100 }).notNull().unique(),
  is_results_public: boolean("is_results_public").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const osborn_checklist_inputs = pgTable("osborn_checklist_inputs", {
  id: serial("id").primaryKey(),
  osborn_checklist_id: integer("osborn_checklist_id").notNull(),
  checklist_type: varchar("checklist_type", { length: 50 }).notNull(),
  content: varchar("content", { length: 1000 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export const osborn_ai_generations = pgTable("osborn_ai_generations", {
  id: serial("id").primaryKey(),
  osborn_checklist_id: integer("osborn_checklist_id").notNull().unique(),
  generation_status: varchar("generation_status", { length: 20 }).notNull(),
  generation_result: text("generation_result"),
  error_message: text("error_message"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// DBクライアント
let dbClient: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getTestDb() {
  if (!db) {
    dbClient = postgres(process.env.DATABASE_URL!, { max: 1 });
    db = drizzle(dbClient);
  }
  return db;
}

export async function closeTestDb() {
  if (dbClient) {
    await dbClient.end();
    dbClient = null;
    db = null;
  }
}

// テストデータ作成ヘルパー
export async function createTestOsbornChecklist(params: {
  userId: string;
  title?: string;
  themeName?: string;
  description?: string;
}) {
  const db = getTestDb();
  const publicToken = 'test-' + Math.random().toString(36).substring(2, 12);

  const [checklist] = await db
    .insert(osborn_checklists)
    .values({
      user_id: params.userId,
      title: params.title || "テスト用チェックリスト",
      theme_name: params.themeName || "スマートフォン",
      description: params.description || "テスト用の説明",
      public_token: publicToken,
      is_results_public: false,
    })
    .returning();

  return checklist;
}

export async function createTestAIGeneration(osbornChecklistId: number) {
  const db = getTestDb();

  const [generation] = await db
    .insert(osborn_ai_generations)
    .values({
      osborn_checklist_id: osbornChecklistId,
      generation_status: "pending",
    })
    .returning();

  return generation;
}

export async function createTestInput(params: {
  osbornChecklistId: number;
  checklistType: string;
  content: string;
}) {
  const db = getTestDb();

  const [input] = await db
    .insert(osborn_checklist_inputs)
    .values({
      osborn_checklist_id: params.osbornChecklistId,
      checklist_type: params.checklistType,
      content: params.content,
    })
    .returning();

  return input;
}

// テストユーザー作成ヘルパー
export async function createTestUser() {
  const db = getTestDb();

  try {
    const [user] = await db
      .insert(users)
      .values({
        id: TEST_USER_ID,
        name: "Test User (Vitest)",
        email: "test-vitest@example.com",
      })
      .returning();

    return user;
  } catch (error: unknown) {
    // ユーザーが既に存在する場合はエラーを無視
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      // unique constraint violation
      const [existingUser] = await db.select().from(users).where(eq(users.id, TEST_USER_ID));
      return existingUser;
    }
    throw error;
  }
}

// テストユーザー削除ヘルパー
export async function deleteTestUser() {
  const db = getTestDb();
  await db.delete(users).where(eq(users.id, TEST_USER_ID));
}

// テストデータ削除ヘルパー
export async function deleteTestOsbornChecklist(id: number) {
  const db = getTestDb();

  // 関連データを削除
  await db.delete(osborn_checklist_inputs).where(eq(osborn_checklist_inputs.osborn_checklist_id, id));
  await db.delete(osborn_ai_generations).where(eq(osborn_ai_generations.osborn_checklist_id, id));
  await db.delete(osborn_checklists).where(eq(osborn_checklists.id, id));
}

// テスト用のユーザーID（固定）
export const TEST_USER_ID = "test-user-vitest";
