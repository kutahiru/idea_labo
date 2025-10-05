import { db } from "@/db";
import {
  brainwritings,
  brainwriting_sheets,
  brainwriting_inputs,
  brainwriting_users,
  users,
} from "@/db/schema";
import * as schema from "@/db/schema";
import {
  desc,
  eq,
  and,
  isNotNull,
  lte,
  isNull,
  type ExtractTablesWithRelations,
} from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import {
  BrainwritingListItem,
  BrainwritingFormData,
  BrainwritingTeam,
  BrainwritingInputData,
} from "@/types/brainwriting";
import { USAGE_SCOPE, sortUsersByFirstRow } from "@/utils/brainwriting";
import { generateInviteData } from "@/lib/invite-url";

// 一覧取得
export async function getBrainwritingsByUserId(userId: string): Promise<BrainwritingListItem[]> {
  return await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      inviteToken: brainwritings.invite_token,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.user_id, userId))
    .orderBy(desc(brainwritings.created_at));
}

// 新規作成
export async function createBrainwriting(userId: string, data: BrainwritingFormData) {
  // URLを生成
  const inviteData = generateInviteData();

  return await db.transaction(async tx => {
    const result = await tx
      .insert(brainwritings)
      .values({
        user_id: userId,
        title: data.title,
        theme_name: data.themeName,
        description: data.description,
        usage_scope: data.usageScope,
        invite_token: inviteData.token,
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

    // brainwriting_usersを作成
    await tx.insert(brainwriting_users).values({
      brainwriting_id: brainwriting.id,
      user_id: userId,
    });

    // X投稿版の場合、brainwriting_sheetsを自動生成
    if (data.usageScope === USAGE_SCOPE.XPOST) {
      await createSheetsWithInputsInternal(tx, brainwriting.id);
    }

    // 招待URLを含むレスポンスを返す
    return {
      ...brainwriting,
      inviteUrl: inviteData.url, // 完全なURLをレスポンスに含める
    };
  });
}

// 更新
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
    .where(and(eq(brainwritings.id, id), eq(brainwritings.user_id, userId)))
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

// 削除
export async function deleteBrainwriting(id: number, userId: string) {
  const result = await db
    .delete(brainwritings)
    .where(and(eq(brainwritings.id, id), eq(brainwritings.user_id, userId)))
    .returning({ id: brainwritings.id });

  return result[0];
}

// 単一取得（内部用・権限チェックなし）
export async function getBrainwritingByIdInternal(id: number) {
  const result = await db
    .select({
      id: brainwritings.id,
      userId: brainwritings.user_id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      inviteToken: brainwritings.invite_token,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.id, id))
    .limit(1);

  return result[0];
}

// 単一取得（ユーザー権限チェック付き）
export async function getBrainwritingById(id: number, userId: string) {
  const result = await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      inviteToken: brainwritings.invite_token,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(and(eq(brainwritings.id, id), eq(brainwritings.user_id, userId)))
    .limit(1);

  return result[0];
}

// 入力データ作成・更新
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
        content: content.trim() === "" ? null : content,
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

// シート全件取得
export async function getBrainwritingSheetsByBrainwritingId(brainwritingId: number) {
  return await db
    .select()
    .from(brainwriting_sheets)
    .where(eq(brainwriting_sheets.brainwriting_id, brainwritingId))
    .orderBy(brainwriting_sheets.id);
}

// シート単体取得
export async function getBrainwritingSheetById(sheetId: number) {
  const result = await db
    .select()
    .from(brainwriting_sheets)
    .where(eq(brainwriting_sheets.id, sheetId))
    .limit(1);

  return result[0] || null;
}

// シート単体取得（ブレインライティング情報付き）
export async function getBrainwritingSheetWithBrainwriting(sheetId: number) {
  const result = await db
    .select({
      sheet: brainwriting_sheets,
      brainwriting: {
        id: brainwritings.id,
        usageScope: brainwritings.usage_scope,
      },
    })
    .from(brainwriting_sheets)
    .leftJoin(brainwritings, eq(brainwriting_sheets.brainwriting_id, brainwritings.id))
    .where(eq(brainwriting_sheets.id, sheetId))
    .limit(1);

  return result[0] || null;
}

// 入力データ取得(シートID条件)
export async function getBrainwritingInputsBySheetId(
  brainwritingSheetId: number
): Promise<BrainwritingInputData[]> {
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
    .where(eq(brainwriting_inputs.brainwriting_sheet_id, brainwritingSheetId))
    .orderBy(brainwriting_inputs.id);
}

// 入力データ取得(ブレインライティングID条件)
export async function getBrainwritingInputsByBrainwritingId(
  brainwritingId: number
): Promise<BrainwritingInputData[]> {
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
    .where(eq(brainwriting_inputs.brainwriting_id, brainwritingId))
    .orderBy(brainwriting_inputs.id);
}

// 単一取得(トークン条件)
export async function getBrainwritingByToken(token: string): Promise<BrainwritingListItem | null> {
  const result = await db
    .select({
      id: brainwritings.id,
      title: brainwritings.title,
      themeName: brainwritings.theme_name,
      description: brainwritings.description,
      usageScope: brainwritings.usage_scope,
      inviteToken: brainwritings.invite_token,
      isInviteActive: brainwritings.is_invite_active,
      createdAt: brainwritings.created_at,
    })
    .from(brainwritings)
    .where(eq(brainwritings.invite_token, token))
    .limit(1);

  return result[0] || null;
}

// 参加者取得(参加順でソート)
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
    .orderBy(brainwriting_users.id);
}

// 詳細取得(全シート、ユーザー、入力データ含む)
export async function getBrainwritingDetailById(brainwritingId: number, userId: string) {
  // 基本情報取得
  const brainwriting = await getBrainwritingById(brainwritingId, userId);
  if (!brainwriting) {
    return null;
  }

  // 参加者情報を取得（参加順でソート）
  const users = await getBrainwritingUsersByBrainwritingId(brainwritingId);

  // 全シート取得
  const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);

  // 入力データ取得
  const inputs = await getBrainwritingInputsByBrainwritingId(brainwritingId);

  return {
    ...brainwriting,
    sheets,
    inputs,
    users,
  };
}

// 詳細取得(単一シート、ユーザー、入力データ含む)
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
  const brainwriting = await getBrainwritingByIdInternal(sheet.brainwriting_id);
  if (!brainwriting) {
    return null;
  }

  // 該当シートの入力データ取得
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

// チーム用のシート一覧、参加者取得
export async function getBrainwritingTeamByBrainwritingId(
  brainwritingId: number
): Promise<BrainwritingTeam | null> {
  // 基本情報取得
  const brainwriting = await getBrainwritingByIdInternal(brainwritingId);
  if (!brainwriting) {
    return null;
  }

  // 参加者情報を取得（参加順でソート）
  const users = await getBrainwritingUsersByBrainwritingId(brainwritingId);

  // 全シート取得
  const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);

  return {
    ...brainwriting,
    sheets,
    users,
  };
}

// ブレインライティングに参加
export async function joinBrainwriting(brainwritingId: number, userId: string, usageScope: string) {
  // 既に参加済みかチェック
  const { isJoined } = await checkJoinStatus(brainwritingId, userId);
  if (isJoined) {
    throw new Error("既に参加しています");
  }

  // 参加人数が上限に達しているかチェック
  const { isFull } = await checkUserCount(brainwritingId);
  if (isFull) {
    throw new Error("参加人数が上限に達しています");
  }

  // X投稿版の場合、ロック状態をチェック
  if (usageScope === USAGE_SCOPE.XPOST) {
    const { isLocked } = await checkSheetLockStatus(brainwritingId, userId);
    if (isLocked) {
      throw new Error("他の方が編集中です");
    }
  }

  // チーム版の場合、シートが存在していて参加者に含まれていない場合は参加不可
  if (usageScope === USAGE_SCOPE.TEAM) {
    const teamJoinable = await checkTeamJoinable(brainwritingId, userId);
    if (!teamJoinable.canJoin) {
      throw new Error("参加できません");
    }
  }

  // 参加者として追加
  const result = await db
    .insert(brainwriting_users)
    .values({
      brainwriting_id: brainwritingId,
      user_id: userId,
    })
    .returning();

  let sheetId: number | undefined;

  const lockDurationMinutes = Number(process.env.BRAINWRITING_LOCK_DURATION_MINUTES) || 10;
  const lockExpiresAt = new Date(Date.now() + lockDurationMinutes * 60 * 1000);

  if (usageScope === USAGE_SCOPE.XPOST) {
    // X投稿版の場合、既存のシートを更新
    const sheetResult = await db
      .update(brainwriting_sheets)
      .set({
        current_user_id: userId,
        lock_expires_at: lockExpiresAt,
      })
      .where(eq(brainwriting_sheets.brainwriting_id, brainwritingId))
      .returning();

    sheetId = sheetResult[0]?.id;

    // X投稿版の場合、参加時に空の入力データを作成
    if (sheetId) {
      // 現在の参加者数を取得
      const users = await getBrainwritingUsersByBrainwritingId(brainwritingId);
      const rowIndex = users.length - 1; // 新規参加者の行インデックス

      // 3つのアイデア入力用の空データを作成
      const inputValues = [];
      for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
        inputValues.push({
          brainwriting_id: brainwritingId,
          brainwriting_sheet_id: sheetId,
          input_user_id: userId,
          row_index: rowIndex,
          column_index: columnIndex,
          content: null,
        });
      }

      await db.insert(brainwriting_inputs).values(inputValues);
    }
  }

  return { success: true, data: result[0], sheetId };
}

// トランザクション型定義
type DbTransaction = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

// ユーザー毎にシートと入力データを作成（内部用）
async function createSheetsWithInputsInternal(tx: DbTransaction, brainwritingId: number) {
  // 参加者情報を取得
  const users = await tx
    .select({
      id: brainwriting_users.id,
      user_id: brainwriting_users.user_id,
    })
    .from(brainwriting_users)
    .where(eq(brainwriting_users.brainwriting_id, brainwritingId));

  // 各ユーザーに対してシートと入力データを作成
  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    // シートを作成
    const sheetResult = await tx
      .insert(brainwriting_sheets)
      .values({
        brainwriting_id: brainwritingId,
        current_user_id: user.user_id,
      })
      .returning();

    const sheetId = sheetResult[0].id;

    // 空の入力データを作成（rowIndex: 0, columnIndex: 0-2）
    const inputValues = [];
    for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
      inputValues.push({
        brainwriting_id: brainwritingId,
        brainwriting_sheet_id: sheetId,
        input_user_id: user.user_id,
        row_index: 0,
        column_index: columnIndex,
        content: null,
      });
    }

    await tx.insert(brainwriting_inputs).values(inputValues);
  }

  return { success: true };
}

// ユーザー毎にシートと入力データを作成（チーム版開始時用）
export async function createSheetsForTeam(brainwritingId: number) {
  return await db.transaction(async tx => {
    return await createSheetsWithInputsInternal(tx, brainwritingId);
  });
}

// ユーザーがブレインライティングに参加しているかチェック
export async function checkJoinStatus(brainwritingId: number, userId: string) {
  const brainwritingUsers = await db
    .select()
    .from(brainwriting_users)
    .where(
      and(
        eq(brainwriting_users.brainwriting_id, brainwritingId),
        eq(brainwriting_users.user_id, userId)
      )
    )
    .limit(1);

  const isJoined = brainwritingUsers.length > 0;

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
    joinData: brainwritingUsers[0] || null,
    sheetId, //ログイン済みの場合、参加状況をチェックして既に参加していればリダイレクトするために使用
  };
}

// ユーザー数をチェック
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

// チーム版の参加可否をチェック（シートが存在していて参加者に含まれていない場合は参加不可）
export async function checkTeamJoinable(brainwritingId: number, userId: string) {
  const sheets = await getBrainwritingSheetsByBrainwritingId(brainwritingId);

  // シートが存在しない場合は参加可能
  if (sheets.length === 0) {
    return { canJoin: true };
  }

  // シートが存在する場合、参加者に含まれているかチェック
  const brainwritingUsers = await db
    .select()
    .from(brainwriting_users)
    .where(
      and(
        eq(brainwriting_users.brainwriting_id, brainwritingId),
        eq(brainwriting_users.user_id, userId)
      )
    )
    .limit(1);

  const isParticipant = brainwritingUsers.length > 0;

  return {
    canJoin: isParticipant,
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
      lockExpiresAt: currentSheet.lock_expires_at,
    };
  }

  return {
    isLocked: false,
    lockExpiresAt: null,
  };
}

// シートのロックを解除
export async function unlockSheet(sheetId: number, userId: string) {
  await db
    .update(brainwriting_sheets)
    .set({
      current_user_id: null,
      lock_expires_at: null,
    })
    .where(
      and(eq(brainwriting_sheets.id, sheetId), eq(brainwriting_sheets.current_user_id, userId))
    );
}

// チーム利用版: シートを次のユーザーに交代
export async function rotateSheetToNextUser(sheetId: number, currentUserId: string) {
  // シート情報を取得
  const sheet = await getBrainwritingSheetById(sheetId);
  if (!sheet) {
    throw new Error("シートが見つかりません");
  }

  // inputsと参加者一覧を取得
  const inputs = await getBrainwritingInputsBySheetId(sheetId);
  const allUsers = await getBrainwritingUsersByBrainwritingId(sheet.brainwriting_id);

  // 1行目のユーザーを先頭にした配列に組み直す
  const sortedUsers = sortUsersByFirstRow(inputs, allUsers);

  // 現在のユーザーのインデックスを取得
  const currentIndex = sortedUsers.findIndex(user => user.user_id === currentUserId);
  if (currentIndex === -1) {
    throw new Error("現在のユーザーが参加者一覧に見つかりません");
  }

  // 次のユーザーを取得（最後の場合はNULL）
  const nextIndex = currentIndex + 1;
  const nextUserId = nextIndex < sortedUsers.length ? sortedUsers[nextIndex].user_id : null;

  // シートのcurrent_user_idを次のユーザーに更新
  await db
    .update(brainwriting_sheets)
    .set({
      current_user_id: nextUserId,
    })
    .where(eq(brainwriting_sheets.id, sheetId));

  return {
    success: true,
  };
}
