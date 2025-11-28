/**
 * オズボーンのチェックリスト機能のデータアクセス層
 * オズボーンのCRUD操作を提供します。
 */

import { db } from "@/db";
import { osborn_checklists, osborn_checklist_inputs, osborn_ai_generations } from "@/db/schema";
import { OsbornChecklistListItem, OsbornChecklistInputData } from "@/types/osborn-checklist";
import { OsbornChecklistFormData, OsbornChecklistType } from "@/schemas/osborn-checklist";
import { desc, eq, and, sql, gte } from "drizzle-orm";
import { generateToken } from "@/lib/token";

/**
 * AI生成状態の有効期限（ミリ秒）
 * 5分以内の状態のみ有効とする
 */
const AI_GENERATION_EXPIRY_MS = 5 * 60 * 1000;

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
  // 公開トークンを生成
  const publicToken = generateToken();

  return await db.transaction(async tx => {
    const result = await tx
      .insert(osborn_checklists)
      .values({
        user_id: userId,
        title: data.title,
        theme_name: data.themeName,
        description: data.description,
        public_token: publicToken,
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
      publicToken: osborn_checklists.public_token,
      isResultsPublic: osborn_checklists.is_results_public,
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

  // AI生成情報を取得
  const aiGeneration = await getAIGenerationByOsbornChecklistId(osbornChecklistId);

  return {
    ...osbornChecklist,
    inputs,
    aiGeneration: aiGeneration
      ? {
          status: aiGeneration.generation_status,
          errorMessage: aiGeneration.error_message,
        }
      : null,
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

//#region オズボーンの詳細の取得（公開トークン条件）
/**
 * オズボーン詳細の取得（公開トークン条件）
 * @param token - 公開トークン
 * @returns オズボーン詳細情報（公開されていない場合はnull）
 */
export async function getOsbornChecklistDetailByToken(token: string) {
  // トークンでオズボーン基本情報を取得（公開されているもののみ）
  const result = await db
    .select({
      id: osborn_checklists.id,
      userId: osborn_checklists.user_id,
      title: osborn_checklists.title,
      themeName: osborn_checklists.theme_name,
      description: osborn_checklists.description,
      publicToken: osborn_checklists.public_token,
      isResultsPublic: osborn_checklists.is_results_public,
      createdAt: osborn_checklists.created_at,
    })
    .from(osborn_checklists)
    .where(
      and(eq(osborn_checklists.public_token, token), eq(osborn_checklists.is_results_public, true))
    )
    .limit(1);

  const osbornChecklist = result[0];

  // 見つからない場合はnull
  if (!osbornChecklist) {
    return null;
  }

  // 入力データ取得
  const inputs = await getOsbornChecklistInputsByOsbornChecklistId(osbornChecklist.id);

  return {
    ...osbornChecklist,
    inputs,
    aiGeneration: null, // 公開ページではAI生成情報は表示しない
  };
}
//#endregion

//#region オズボーンの結果公開フラグの更新
/**
 * オズボーンの結果公開フラグの更新
 * @param osbornChecklistId - オズボーンID
 * @param userId - ユーザーID
 * @param isResultsPublic - 結果公開フラグ
 */
export async function updateOsbornChecklistIsResultsPublic(
  osbornChecklistId: number,
  userId: string,
  isResultsPublic: boolean
) {
  await db
    .update(osborn_checklists)
    .set({
      is_results_public: isResultsPublic,
      updated_at: sql`NOW()`,
    })
    .where(and(eq(osborn_checklists.id, osbornChecklistId), eq(osborn_checklists.user_id, userId)));
}
//#endregion

//#region AI生成の取得(指定時刻以内)
/**
 * AI生成状態を取得
 * @param osbornChecklistId - オズボーンID
 * @returns AI生成状態（存在しない場合はnull）
 */
export async function getAIGenerationByOsbornChecklistId(osbornChecklistId: number) {
  const expiryTime = new Date(Date.now() - AI_GENERATION_EXPIRY_MS);

  const result = await db
    .select()
    .from(osborn_ai_generations)
    .where(
      and(
        eq(osborn_ai_generations.osborn_checklist_id, osbornChecklistId),
        gte(osborn_ai_generations.updated_at, expiryTime)
      )
    )
    .orderBy(desc(osborn_ai_generations.id))
    .limit(1);

  return result[0] || null;
}
//#endregion

//#region AI生成ジョブの作成
/**
 * AI生成ジョブを作成
 * @param osbornChecklistId - オズボーンID
 * @returns 作成されたジョブ
 */
export async function createAIGeneration(osbornChecklistId: number) {
  const result = await db
    .insert(osborn_ai_generations)
    .values({
      osborn_checklist_id: osbornChecklistId,
      generation_status: "pending",
    })
    .returning();

  return result[0];
}
//#endregion

//#region AI生成状態の更新
/**
 * AI生成状態を更新
 * @param id - AI生成ID
 * @param status - ステータス
 * @param errorMessage - エラーメッセージ（オプション）
 */
export async function updateAIGenerationStatus(
  id: number,
  status: "pending" | "processing" | "completed" | "failed",
  errorMessage?: string
) {
  await db
    .update(osborn_ai_generations)
    .set({
      generation_status: status,
      error_message: errorMessage || null,
      updated_at: sql`NOW()`,
    })
    .where(eq(osborn_ai_generations.id, id));
}
//#endregion

//#region AI生成結果の保存
/**
 * AI生成結果を保存
 * @param id - AI生成ID
 * @param result - 生成結果（JSON文字列）
 */
export async function updateAIGenerationResult(id: number, result: string) {
  await db
    .update(osborn_ai_generations)
    .set({
      generation_status: "completed",
      generation_result: result,
      updated_at: sql`NOW()`,
    })
    .where(eq(osborn_ai_generations.id, id));
}
//#endregion
