import { db } from "@/db";
import {
  brainwritings,
  brainwriting_sheets,
  brainwriting_inputs,
  brainwriting_users,
  users,
} from "@/db/schema";
import { desc, eq, and, isNotNull, lte, isNull } from "drizzle-orm";
import { BrainwritingListItem, BrainwritingFormData } from "@/types/brainwriting";
import { USAGE_SCOPE } from "@/utils/brainwriting";
import { generateInviteData } from "@/lib/invite-url";

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
  // 全てのブレインライティングで招待URLを生成
  const inviteData = generateInviteData();

  const result = await db
    .insert(brainwritings)
    .values({
      user_id: userId,
      title: data.title,
      theme_name: data.themeName,
      description: data.description,
      usage_scope: data.usageScope,
      invite_token: inviteData.token, // トークンをDBに保存
    })
    .returning({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      inviteToken: brainwritings.invite_token,
      createdAt: brainwritings.created_at,
    });

  const brainwriting = result[0];

  // X投稿版の場合、brainwriting_usersとbrainwriting_sheetsを自動生成
  if (data.usageScope === USAGE_SCOPE.XPOST) {
    await db.insert(brainwriting_users).values({
      brainwriting_id: brainwriting.id,
      user_id: userId,
    });

    await db.insert(brainwriting_sheets).values({
      brainwriting_id: brainwriting.id,
      current_user_id: userId,
    });
  }

  // 招待URLを含むレスポンスを返す
  return {
    ...brainwriting,
    inviteUrl: inviteData.url, // 完全なURLをレスポンスに含める
  };
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

// ブレインライティング入力データ作成・更新
export async function upsertBrainwritingInput(
  brainwritingId: number,
  brainwritingSheetId: number,
  inputUserId: string,
  rowIndex: number,
  columnIndex: number,
  content: string
) {
  // 空文字の場合はNULLに変換
  const normalizedContent = content.trim() === "" ? null : content;
  // 既存の入力があるかチェック
  const existingInput = await db
    .select()
    .from(brainwriting_inputs)
    .where(
      and(
        eq(brainwriting_inputs.brainwriting_id, brainwritingId),
        eq(brainwriting_inputs.brainwriting_sheet_id, brainwritingSheetId),
        eq(brainwriting_inputs.row_index, rowIndex),
        eq(brainwriting_inputs.column_index, columnIndex)
      )
    )
    .limit(1);

  if (existingInput.length > 0) {
    // 更新
    const result = await db
      .update(brainwriting_inputs)
      .set({
        content: normalizedContent,
        input_user_id: inputUserId,
      })
      .where(eq(brainwriting_inputs.id, existingInput[0].id))
      .returning();

    return result[0];
  } else {
    // 新規作成
    const result = await db
      .insert(brainwriting_inputs)
      .values({
        brainwriting_id: brainwritingId,
        brainwriting_sheet_id: brainwritingSheetId,
        input_user_id: inputUserId,
        row_index: rowIndex,
        column_index: columnIndex,
        content: normalizedContent,
      })
      .returning();

    return result[0];
  }
}

// ブレインライティングシート全件取得
export async function getBrainwritingSheetsByBrainwritingId(brainwritingId: number) {
  return await db
    .select()
    .from(brainwriting_sheets)
    .where(eq(brainwriting_sheets.brainwriting_id, brainwritingId));
}

// ブレインライティングシート単体取得
export async function getBrainwritingSheetById(sheetId: number) {
  const result = await db
    .select()
    .from(brainwriting_sheets)
    .where(eq(brainwriting_sheets.id, sheetId))
    .limit(1);

  return result[0] || null;
}

// ブレインライティング入力データ取得（ユーザー名含む）
export async function getBrainwritingInputsBySheetId(brainwritingSheetId: number) {
  return await db
    .select({
      id: brainwriting_inputs.id,
      brainwriting_id: brainwriting_inputs.brainwriting_id,
      brainwriting_sheet_id: brainwriting_inputs.brainwriting_sheet_id,
      input_user_id: brainwriting_inputs.input_user_id,
      input_user_name: users.name,
      row_index: brainwriting_inputs.row_index,
      column_index: brainwriting_inputs.column_index,
      content: brainwriting_inputs.content,
      created_at: brainwriting_inputs.created_at,
      updated_at: brainwriting_inputs.updated_at,
    })
    .from(brainwriting_inputs)
    .leftJoin(users, eq(brainwriting_inputs.input_user_id, users.id))
    .where(eq(brainwriting_inputs.brainwriting_sheet_id, brainwritingSheetId));
}

// トークンを使ってブレインライティング取得
export async function getBrainwritingByToken(token: string): Promise<BrainwritingListItem | null> {
  const result = await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      isInviteActive: brainwritings.is_invite_active,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.invite_token, token))
    .limit(1);

  return result[0] || null;
}

// ブレインライティング参加者取得（参加順でソート）
export async function getBrainwritingUsersByBrainwritingId(brainwritingId: number) {
  return await db
    .select({
      id: brainwriting_users.id,
      brainwriting_id: brainwriting_users.brainwriting_id,
      user_id: brainwriting_users.user_id,
      user_name: users.name,
      created_at: brainwriting_users.created_at,
      updated_at: brainwriting_users.updated_at,
    })
    .from(brainwriting_users)
    .leftJoin(users, eq(brainwriting_users.user_id, users.id))
    .where(eq(brainwriting_users.brainwriting_id, brainwritingId))
    .orderBy(brainwriting_users.created_at);
}

// ブレインライティング詳細取得（シート・入力データ含む）
export async function getBrainwritingDetailById(id: number, userId: string) {
  // 基本情報取得
  const brainwriting = await getBrainwritingById(id, userId);
  if (!brainwriting) {
    return null;
  }

  // 全シート取得
  const sheets = await getBrainwritingSheetsByBrainwritingId(id);

  // 全シートの入力データ取得
  const inputs = [];
  for (const sheet of sheets) {
    const sheetInputs = await getBrainwritingInputsBySheetId(sheet.id);
    inputs.push(...sheetInputs);
  }

  // 参加者情報を取得（参加順でソート）
  const users = await getBrainwritingUsersByBrainwritingId(id);

  return {
    ...brainwriting,
    sheets,
    inputs,
    users,
  };
}

// ブレインライティング詳細取得（参加者用・所有者チェックなし）
export async function getBrainwritingDetailForBrainwritingUser(sheetId: number, userId: string) {
  // シート取得
  const sheet = await getBrainwritingSheetById(sheetId);
  if (!sheet) {
    return null;
  }

  // 参加チェック
  const { isJoined } = await checkJoinStatus(sheet.brainwriting_id, userId);
  if (!isJoined) {
    return null;
  }

  // 基本情報取得
  const brainwritingResult = await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.id, sheet.brainwriting_id))
    .limit(1);

  const brainwriting = brainwritingResult[0];
  if (!brainwriting) {
    return null;
  }

  // 全シートの入力データ取得
  const inputs = await getBrainwritingInputsBySheetId(sheet.id);

  // 参加者情報を取得（参加順でソート）
  const users = await getBrainwritingUsersByBrainwritingId(sheet.brainwriting_id);

  return {
    ...brainwriting,
    sheets: [sheet], //データ型を流用しているため、配列として返す
    inputs,
    users,
  };
}

// ブレインライティングに参加
export async function joinBrainwriting(brainwritingId: number, userId: string, usageScope: string) {
  // 参加者として追加
  const result = await db
    .insert(brainwriting_users)
    .values({
      brainwriting_id: brainwritingId,
      user_id: userId,
    })
    .returning();

  let sheetId: number | undefined;

  if (usageScope === USAGE_SCOPE.TEAM) {
    // チーム版の場合、新しいシートを作成
    const lockExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const sheetResult = await db
      .insert(brainwriting_sheets)
      .values({
        brainwriting_id: brainwritingId,
        current_user_id: userId,
        lock_expires_at: lockExpiresAt,
      })
      .returning();

    sheetId = sheetResult[0]?.id;
  } else if (usageScope === USAGE_SCOPE.XPOST) {
    // X投稿版の場合、既存のシートを更新
    const lockExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const sheetResult = await db
      .update(brainwriting_sheets)
      .set({
        current_user_id: userId,
        lock_expires_at: lockExpiresAt,
      })
      .where(eq(brainwriting_sheets.brainwriting_id, brainwritingId))
      .returning();

    sheetId = sheetResult[0]?.id;
  }

  return { success: true, data: result[0], sheetId };
}

// ユーザーがブレインライティングに参加しているかチェック
export async function checkJoinStatus(brainwritingId: number, userId: string) {
  const participation = await db
    .select()
    .from(brainwriting_users)
    .where(
      and(
        eq(brainwriting_users.brainwriting_id, brainwritingId),
        eq(brainwriting_users.user_id, userId)
      )
    )
    .limit(1);

  const isJoined = participation.length > 0;

  // 参加している場合、シートIDも取得
  let sheetId: number | null = null;
  if (isJoined) {
    const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);
    if (sheets.length > 0) {
      sheetId = sheets[0].id;
    }
  }

  return {
    isJoined,
    joinData: participation[0] || null,
    sheetId,
  };
}

// ブレインライティングのユーザー数をチェック
export async function checkUserCount(brainwritingId: number) {
  const users = await db
    .select()
    .from(brainwriting_users)
    .where(eq(brainwriting_users.brainwriting_id, brainwritingId));

  return {
    currentCount: users.length,
    maxCount: 6,
    isFull: users.length >= 6,
  };
}

// 放置されている状態をクリアする
export async function clearAbandonedSessions(brainwritingId: number) {
  const now = new Date();

  // クリア対象のシートを抽出
  const sheetsToClear = await db
    .selectDistinct({
      brainwriting_sheet_id: brainwriting_sheets.id,
      current_user_id: brainwriting_sheets.current_user_id,
    })
    .from(brainwriting_sheets)
    .leftJoin(
      brainwriting_inputs,
      and(
        eq(brainwriting_sheets.id, brainwriting_inputs.brainwriting_sheet_id),
        eq(brainwriting_sheets.current_user_id, brainwriting_inputs.input_user_id)
      )
    )
    .where(
      and(
        eq(brainwriting_sheets.brainwriting_id, brainwritingId),
        isNotNull(brainwriting_sheets.lock_expires_at), //ロック期限が設定されている
        lte(brainwriting_sheets.lock_expires_at, now), //ロック期限が過ぎている
        isNull(brainwriting_inputs.content) //アイデアが未入力
      )
    );

  // 各対象シートをクリア
  for (const sheetData of sheetsToClear) {
    if (!sheetData.current_user_id) continue;

    // brainwriting_sheetsのcurrent_userとlock_expires_atをクリア
    await db
      .update(brainwriting_sheets)
      .set({
        current_user_id: null,
        lock_expires_at: null,
      })
      .where(eq(brainwriting_sheets.id, sheetData.brainwriting_sheet_id));

    // current_user_idと一致するbrainwriting_inputsをクリア
    if (sheetData.current_user_id) {
      await db
        .delete(brainwriting_inputs)
        .where(
          and(
            eq(brainwriting_inputs.brainwriting_sheet_id, sheetData.brainwriting_sheet_id),
            eq(brainwriting_inputs.input_user_id, sheetData.current_user_id)
          )
        );

      // brainwriting_usersからも該当ユーザーを削除
      await db
        .delete(brainwriting_users)
        .where(
          and(
            eq(brainwriting_users.brainwriting_id, brainwritingId),
            eq(brainwriting_users.user_id, sheetData.current_user_id)
          )
        );
    }
  }
}

// X投稿版のシートロック状態をチェック
export async function checkSheetLockStatus(brainwritingId: number, userId: string) {
  const sheet = await db
    .select()
    .from(brainwriting_sheets)
    .where(eq(brainwriting_sheets.brainwriting_id, brainwritingId))
    .limit(1);

  if (sheet.length === 0) {
    return {
      isLocked: false,
      lockedByUser: null,
      lockExpiresAt: null,
    };
  }

  const now = new Date();
  const currentSheet = sheet[0];

  // 他のユーザーがロックしているかチェック
  if (
    currentSheet.current_user_id &&
    currentSheet.current_user_id !== userId &&
    currentSheet.lock_expires_at &&
    currentSheet.lock_expires_at > now
  ) {
    return {
      isLocked: true,
      lockedByUser: currentSheet.current_user_id,
      lockExpiresAt: currentSheet.lock_expires_at,
    };
  }

  return {
    isLocked: false,
    lockedByUser: null,
    lockExpiresAt: null,
  };
}
